import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT')
        if (!apiKey) throw new Error("GOOGLE_API_KEY_CHAT no está configurada.");

        const keySnippet = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
        console.log("Using key snippet:", keySnippet);

        // Usamos fetch directo para consultar la API de Google
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        const modelNames = data.models?.map((m: any) => m.name) || [];

        return new Response(
            JSON.stringify({
                success: true,
                models: modelNames,
                full_data: data
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
