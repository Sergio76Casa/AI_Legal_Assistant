import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'
import { encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * AUTOMATED_PDF_INGESTOR
 * Esta función es disparada por un Webhook de Supabase Storage.
 * Procesa automáticamente nuevos PDFs: Extrae -> Limpia -> Chunking -> Embedding -> KB.
 */
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const payload = await req.json();
        console.log("Storage Webhook Payload:", JSON.stringify(payload));

        // El Webhook de almacenamiento envía el récord insertado en storage.objects
        const record = payload.record;
        if (!record) throw new Error("No record found in payload");

        const bucket_id = record.bucket_id;
        const file_path = record.name;
        const user_id = record.owner; // El owner suele ser el user_id del que subió el archivo

        if (!file_path.toLowerCase().endsWith('.pdf')) {
            console.log("Not a PDF, skipping:", file_path);
            return new Response(JSON.stringify({ skipped: true, reason: "Not a PDF" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        // 1. Descargar el archivo
        console.log(`Downloading: ${file_path} from ${bucket_id}`);
        const { data: fileData, error: downloadError } = await supabase.storage.from(bucket_id).download(file_path);
        if (downloadError) throw downloadError;

        // 2. Extracción de Texto con Gemini 2.0 Flash
        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY_CHAT')!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const bytes = new Uint8Array(await fileData.arrayBuffer());
        const base64 = encode(bytes);

        console.log("Extracting text with Gemini 2.0 Flash...");
        const extractionResult = await model.generateContent([
            {
                inlineData: {
                    data: base64,
                    mimeType: "application/pdf"
                }
            },
            "Extrae todo el texto de este PDF de forma literal. Solo devuelve el texto plano, sin comentarios."
        ]);
        let fullText = extractionResult.response.text();

        // 3. Limpieza Proactiva con Regex
        console.log("Cleaning text...");
        fullText = fullText
            .replace(/\n{3,}/g, '\n\n') // Eliminar saltos de línea excesivos
            .replace(/\b(Página|Pag|Page)\s?\d+\s?(de|of)?\s?\d*\b/gi, '') // Eliminar "Página X de Y"
            .replace(/[-]{3,}/g, '') // Eliminar separadores largos
            .trim();

        // 4. Chunking Estratégico (1000 chars / 200 overlap)
        console.log("Chunking text...");
        const chunks: string[] = [];
        const chunkSize = 1000;
        const overlap = 200;

        for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
            const chunk = fullText.substring(i, i + chunkSize);
            if (chunk.length > 50) { // Evitar chunks demasiado cortos al final
                chunks.push(chunk);
            }
            if (i + chunkSize >= fullText.length) break;
        }

        console.log(`Generated ${chunks.length} chunks.`);

        // 5. Integración Vectorial (Embeddings) y Guardado
        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });

        for (let j = 0; j < chunks.length; j++) {
            const chunk = chunks[j];
            console.log(`Processing chunk ${j + 1}/${chunks.length}...`);

            const embResult = await embeddingModel.embedContent(chunk);
            const embedding = embResult.embedding.values;

            const { error: insertError } = await supabase.from('knowledge_base').insert({
                content: chunk,
                title: file_path.split('/').pop() || 'Untitled',
                metadata: {
                    source: file_path,
                    bucket: bucket_id,
                    chunk_index: j,
                    total_chunks: chunks.length
                },
                user_id: user_id || null,
                embedding: embedding
            });

            if (insertError) console.error(`Error inserting chunk ${j}:`, insertError.message);
        }

        // 6. Actualizar estado en la tabla documents si existe
        // Buscamos el documento por su URL (file_path)
        await supabase.from('documents')
            .update({ status: 'completed' })
            .eq('url', file_path);

        return new Response(JSON.stringify({ success: true, chunks: chunks.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e: any) {
        console.error("Critical Error in automated-pdf-ingestor:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
})
