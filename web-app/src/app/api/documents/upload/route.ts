import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
const pdf = require('pdf-parse');

// Configurar clientes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Nota: Usar Service Role Key es mejor para interacciones backend, pero Anon Key funcionará si RLS está bien configurado y pasamos el token del usuario.
// Para simplificar, usaremos el cliente creado con el token del usuario para respetar RLS.

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Obtener usuario autenticado
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', details: authError }, { status: 401 });
        }

        // 2. Subir archivo a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Convertir File a Buffer para upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file', details: uploadError }, { status: 500 });
        }

        // Obtener URL pública (o firmada, pero usaremos path relativo para referencia)
        // const publicUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl;
        // Preferimos guardar el path relativo o URL completa.
        const storagePath = fileName;

        // 3. Crear registro en tabla documents
        const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert({
                user_id: user.id,
                name: file.name,
                type: file.type,
                url: storagePath,
                status: 'processing'
            })
            .select()
            .single();

        if (docError) {
            console.error('Database Insert Error:', docError);
            return NextResponse.json({ error: 'Failed to save document metadata', details: docError }, { status: 500 });
        }

        const documentId = docData.id;

        // 4. Extraer texto (Solo PDF por ahora)
        let text = '';
        if (file.type === 'application/pdf') {
            try {
                const pdfData = await pdf(buffer);
                text = pdfData.text;
            } catch (e) {
                console.error('PDF Parse Error:', e);
                await supabase.from('documents').update({ status: 'failed' }).eq('id', documentId);
                return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
            }
        } else {
            // TODO: Implementar OCR para imágenes o lectura de TXT/MD
            await supabase.from('documents').update({ status: 'failed', name: file.name + ' (Unsupported Type)' }).eq('id', documentId);
            return NextResponse.json({ error: 'Unsupported file type for processing (only PDF supported)' }, { status: 400 });
        }

        // 5. Generar Embeddings y Guardar Chunks
        // Dividir texto en chunks (simple split por now)
        const splitter = (str: string, size: number) => {
            const numChunks = Math.ceil(str.length / size);
            const chunks = new Array(numChunks);
            for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                chunks[i] = str.substr(o, size);
            }
            return chunks;
        };

        const chunks = splitter(text, 1000); // ~1000 caracteres por chunk
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        let processedChunks = 0;

        for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            try {
                const result = await model.embedContent(chunk);
                const embedding = result.embedding.values;

                await supabase.from('knowledge_base').insert({
                    user_id: user.id,
                    document_id: documentId,
                    content: chunk,
                    embedding: embedding,
                    metadata: { source: file.name, page: 'N/A' } // pdf-parse no da páginas fácilmente por chunk
                });
                processedChunks++;
            } catch (e) {
                console.error('Embedding Error:', e);
                // Continuar con siguiente chunk
            }
        }

        // 6. Actualizar estado del documento
        await supabase.from('documents').update({ status: 'indexed' }).eq('id', documentId);

        return NextResponse.json({
            success: true,
            documentId,
            chunks: processedChunks
        });

    } catch (error) {
        console.error('Upload Handler Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
}
