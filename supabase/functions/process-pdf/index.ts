import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'
import { encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const body = await req.json();
        let { text, title, metadata, user_id, bucket_id, file_path, tenant_id } = body;

        const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');

        // Ensure tenant_id is set (default to Global if missing)
        tenant_id = tenant_id || '00000000-0000-0000-0000-000000000000';

        if (bucket_id && file_path) {
            console.log("Downloading file from bucket " + bucket_id + ": " + file_path);
            const { data: fileData, error: downloadError } = await supabase.storage.from(bucket_id).download(file_path);
            if (downloadError) throw downloadError;

            const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
            const genAI = new GoogleGenerativeAI(apiKey!);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const arrayBuffer = await fileData.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const base64 = encode(bytes);

            // Determine mime type
            const ext = file_path.split('.').pop().toLowerCase();
            let mimeType = "application/pdf";
            if (['jpg', 'jpeg'].includes(ext)) mimeType = "image/jpeg";
            else if (ext === 'png') mimeType = "image/png";
            else if (ext === 'webp') mimeType = "image/webp";
            else if (['heic', 'heif'].includes(ext)) mimeType = "image/heic";

            console.log("Extracting text with Gemini 2.0 Flash from " + mimeType + "...");

            const prompt = mimeType === "application/pdf"
                ? "Extrae todo el texto de este PDF de forma literal. Solo devuelve el texto plano, sin comentarios ni formato extra."
                : "Extrae todo el texto visible en esta imagen. Si es un documento, transcribe su contenido con precisión. Solo devuelve el texto plano.";

            const result = await model.generateContent([
                {
                    inlineData: {
                        data: base64,
                        mimeType: mimeType
                    }
                },
                prompt
            ]);

            const response = await result.response;
            text = response.text();
            title = title || file_path.split('/').pop();
        }

        if (!text) throw new Error('No se pudo obtener texto del documento.');

        console.log(`Generating embeddings for: ${title}`);
        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
        const genAI = new GoogleGenerativeAI(apiKey!);
        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });
        const embResult = await embeddingModel.embedContent(text);
        const embedding = embResult.embedding.values;

        const { error: insertError } = await supabase.from('knowledge_base').insert({
            content: text,
            title: title || 'Sin título',
            metadata: {
                ...metadata,
                source: file_path,
                type: 'document'
            },
            user_id: user_id || null,
            tenant_id: tenant_id,
            embedding: embedding
        });

        if (insertError) throw new Error("Error insertando en DB: " + insertError.message);

        // Actualizar el estado del documento original a 'completed'
        const { document_id } = body;
        if (document_id) {
            console.log(`Updating document ${document_id} status to completed`);
            await supabase.from('documents').update({ status: 'completed' }).eq('id', document_id);
        }

        return new Response(JSON.stringify({
            success: true,
            dims: embedding.length,
            extracted: text.substring(0, 100) + "..."
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
})
