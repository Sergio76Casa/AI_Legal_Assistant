import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Función de Ingesta (Ingest) - Soporte Multi-Nivel
 * Permite guardar documentos con un user_id asociado (opcional)
 */
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { content, metadata, user_id } = await req.json()
        if (!content) throw new Error('Content is required')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY_CHAT') ?? '')
        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });

        // 1. Generar Embedding
        const embeddingResult = await embeddingModel.embedContent(content);
        const embedding = embeddingResult.embedding.values;

        // 2. Guardar en Knowledge Base con el user_id proporcionado (null para Global)
        const { data, error } = await supabaseClient
            .from('knowledge_base')
            .insert({
                content,
                metadata,
                embedding,
                user_id: user_id || null
            })
            .select()

        if (error) throw error

        return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
