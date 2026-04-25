import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'
// @ts-ignore Supabase compatibility
import { extractText } from 'npm:unpdf'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function splitIntoChunks(text: string, chunkSize = 400, overlap = 50): string[] {
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const words = cleanText.split(' ').filter(w => w.length > 0)
    if (words.length === 0) return []
    const chunks: string[] = []
    let start = 0
    while (start < words.length) {
        const end = Math.min(start + chunkSize, words.length)
        const chunk = words.slice(start, end).join(' ')
        if (chunk.trim()) chunks.push(chunk)
        if (end >= words.length) break
        start += chunkSize - overlap
    }
    return chunks
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
}

// Llama directamente a la REST API de Gemini con retry y backoff exponencial
async function embedWithRetry(apiKey: string, text: string, maxAttempts = 6): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: { parts: [{ text }] } })
        })
        const data = await res.json()
        if (res.ok) {
            const values = data.embedding?.values
            if (!values?.length) throw new Error('Embedding vacío retornado por Gemini.')
            return values
        }
        const errMsg = data?.error?.message || JSON.stringify(data)
        if (attempt < maxAttempts && (res.status === 429 || res.status >= 500)) {
            // Backoff exponencial: 2s, 4s, 8s, 16s, 32s
            const wait = Math.min(2000 * Math.pow(2, attempt - 1), 32000)
            console.warn(`[EMBED RETRY] Intento ${attempt}/${maxAttempts} — HTTP ${res.status}. Esperando ${wait / 1000}s...`)
            await new Promise(r => setTimeout(r, wait))
            continue
        }
        throw new Error(`Gemini Embedding API [${res.status}]: ${errMsg}`)
    }
    throw new Error('Máximo de reintentos de embedding alcanzado.')
}

async function processDocument(body: any): Promise<object> {
    let { text, title, metadata, user_id, bucket_id, file_path, tenant_id, document_id } = body

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        { auth: { persistSession: false } }
    )

    const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT')
    if (!apiKey) throw new Error('GOOGLE_API_KEY_CHAT no está configurada en Supabase Secrets.')

    // 1. AUTO-LIMPIEZA: borrar fragmentos anteriores del mismo archivo
    if (file_path) {
        console.log(`Auto-Limpieza: ${file_path}`)
        const { error: deleteError } = await supabase
            .from('knowledge_base')
            .delete()
            .eq('metadata->>source', file_path)
        if (deleteError) console.error('Error en auto-limpieza:', deleteError.message)
        else console.log('Limpieza previa completada.')
    }

    // 2. DESCARGA Y EXTRACCIÓN DE TEXTO
    if (bucket_id && file_path) {
        console.log('Descargando archivo desde storage...')
        const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucket_id)
            .download(file_path)

        if (downloadError) throw new Error(`Error de descarga: ${downloadError.message}`)

        const bytes = new Uint8Array(await fileData.arrayBuffer())
        console.log(`Descargado: ${(bytes.length / 1024 / 1024).toFixed(2)} MB`)

        title = title || file_path.split('/').pop()
        const ext = (file_path.split('.').pop() || 'pdf').toLowerCase()
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)

        if (isImage) {
            console.log('Imagen detectada, usando Gemini Vision...')
            let mimeType = 'image/jpeg'
            if (ext === 'png') mimeType = 'image/png'
            else if (ext === 'webp') mimeType = 'image/webp'
            else if (['heic', 'heif'].includes(ext)) mimeType = 'image/heic'

            const visionModel = new GoogleGenerativeAI(apiKey).getGenerativeModel(
                { model: 'gemini-2.0-flash' },
                { apiVersion: 'v1beta' }
            )
            const result = await visionModel.generateContent([
                { inlineData: { data: uint8ArrayToBase64(bytes), mimeType } },
                'Extrae todo el texto visible en esta imagen de forma literal. Solo texto plano, sin comentarios.'
            ])
            text = result.response.text()
            console.log(`Extracción imagen: ${text.length} caracteres.`)
        } else {
            console.log('PDF detectado, extrayendo con UNPDF...')
            try {
                const extracted = await extractText(bytes)
                if (Array.isArray(extracted.text)) text = extracted.text.join('\n')
                else if (typeof extracted.text === 'string') text = extracted.text
                else text = String(extracted.text || extracted || '')
                if (!text || !text.trim()) throw new Error('unpdf extrajo texto vacío del PDF.')
                console.log(`Texto extraído: ${text.length} caracteres.`)
            } catch (nativeErr: any) {
                throw new Error(`Error en la extracción de UNPDF: ${nativeErr.message}`)
            }
        }
    }

    if (!text || text.trim().length === 0) {
        throw new Error('No se pudo extraer texto válido del archivo.')
    }

    // 3. DIVISIÓN EN FRAGMENTOS
    const chunks = splitIntoChunks(text)
    console.log(`División: ${chunks.length} fragmentos a procesar.`)
    if (chunks.length === 0) throw new Error('El documento no contenía suficientes palabras para fragmentarse.')

    // 4. PROCESAMIENTO SECUENCIAL con pausa entre fragmentos
    // Procesamos 1 a 1 con 500ms de pausa ≈ 120 req/min, bien dentro de los límites de Gemini.
    // Para un doc de 344 fragmentos: ~344 × 500ms = ~172s en background — asumible.
    let successCount = 0
    const failedChunks: { index: number, reason: string }[] = []

    const cleanDocumentTitle = (title as string)
        .replace(/^\d+_/, '')
        .replace(/\.pdf$/i, '')

    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i]
        const chunkTitle = chunks.length > 1
            ? `${cleanDocumentTitle} (${i + 1}/${chunks.length})`
            : cleanDocumentTitle

        try {
            const chunkEmbedding = await embedWithRetry(apiKey, chunkText)

            const { error: insertError } = await supabase.from('knowledge_base').insert({
                content: chunkText,
                title: chunkTitle,
                metadata: {
                    ...metadata,
                    source: file_path,
                    type: 'document',
                    chunk_index: i,
                    total_chunks: chunks.length
                },
                user_id: user_id || null,
                tenant_id: tenant_id,
                embedding: chunkEmbedding
            })

            if (insertError) throw new Error(`Supabase Insert Error: ${insertError.message}`)
            successCount++
        } catch (err: any) {
            console.error(`[CHUNK FAIL] índice ${i}: ${err.message}`)
            failedChunks.push({ index: i, reason: err.message })
        }

        // Log de progreso cada 25 fragmentos
        if ((i + 1) % 25 === 0 || i === chunks.length - 1) {
            console.log(`Progreso: ${i + 1}/${chunks.length} — OK: ${successCount} | Fallos: ${failedChunks.length}`)
        }

        // Pausa entre fragmentos para respetar rate limit de Gemini (~120 req/min)
        if (i < chunks.length - 1) {
            await new Promise(r => setTimeout(r, 500))
        }
    }

    console.log(`=== FINALIZADO === OK: ${successCount}/${chunks.length} | Fallos: ${failedChunks.length}`)

    if (successCount === 0) {
        throw new Error(`Fallo masivo. No se guardó ningún fragmento. Primer error: ${failedChunks[0]?.reason}`)
    }

    // 5. ACTUALIZAR ESTADO DEL DOCUMENTO PADRE
    if (document_id) {
        const newStatus = failedChunks.length === 0 ? 'completed' : 'completed_with_errors'
        await supabase.from('documents').update({ status: newStatus }).eq('id', document_id)
    }

    return {
        success: true,
        chunks_created: successCount,
        total_chunks: chunks.length,
        failed_chunks: failedChunks,
        extracted_chars: text.length
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const body = await req.json()
        const { text, bucket_id, file_path, tenant_id } = body

        console.log(`=== PROCESS-PDF START === bucket:${bucket_id} file:${file_path} tenant:${tenant_id}`)

        if (!tenant_id) {
            return new Response(
                JSON.stringify({ error: 'Access Denied: Missing Tenant ID.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!text && (!bucket_id || !file_path)) {
            return new Response(
                JSON.stringify({ error: 'Se requiere file_path + bucket_id o text directo.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const processingPromise = processDocument(body)

        // EdgeRuntime.waitUntil: procesar en background y devolver 202 inmediatamente
        // Esto es clave para PDFs grandes que tardan minutos en procesarse
        const EdgeRuntime = (globalThis as any).EdgeRuntime
        if (EdgeRuntime?.waitUntil) {
            EdgeRuntime.waitUntil(
                processingPromise.catch((e: any) => {
                    console.error('=== PROCESS-PDF BACKGROUND ERROR ===', e.message)
                    if (body.document_id) {
                        const supabase = createClient(
                            Deno.env.get('SUPABASE_URL') || '',
                            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
                            { auth: { persistSession: false } }
                        )
                        supabase.from('documents')
                            .update({ status: 'failed' })
                            .eq('id', body.document_id)
                            .then(() => {})
                    }
                })
            )
            console.log('Procesamiento delegado a background (EdgeRuntime.waitUntil).')
            return new Response(
                JSON.stringify({ accepted: true, document_id: body.document_id }),
                { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Fallback síncrono (entorno local / sin EdgeRuntime)
        const result = await processingPromise
        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (e: any) {
        console.error('=== PROCESS-PDF FATAL ERROR ===', e.message)
        return new Response(
            JSON.stringify({ error: e.message, stack: e.stack }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
