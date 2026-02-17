import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { documentId } = await req.json();

        if (!documentId) {
            return new Response(JSON.stringify({ error: "Missing documentId" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Initialize Supabase Client
        // We need service role key to access knowledge_base securely if RLS is tricky from edge function context without user token
        // ideally, pass user token Authorization header.
        const authHeader = req.headers.get('Authorization');
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader ?? '' } } }
        );

        // 1. Fetch all chunks for the document
        const { data: chunks, error: fetchError } = await supabaseClient
            .from('knowledge_base')
            .select('content')
            .eq('document_id', documentId)
            .order('id', { ascending: true });

        if (fetchError || !chunks || chunks.length === 0) {
            console.error("Fetch Error:", fetchError);
            return new Response(JSON.stringify({ error: "Document not found or empty" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            });
        }

        // Concatenate text
        const fullText = chunks.map(c => c.content).join("\n");

        // 2. Analyze with Gemini
        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
    Analiza el siguiente contrato legal de forma exhaustiva para un usuario no experto.
    
    TEXTO DEL CONTRATO:
    ${fullText.substring(0, 30000)} // Limit to avoid context window issues, though 1.5 Flash has huge window.
    
    TAREA:
    Proporciona un análisis estructurado en formato JSON con los siguientes campos:
    - "summary": Resumen breve de qué trata el contrato (max 50 palabras).
    - "risk_score": Puntuación de riesgo del 1 al 10 (1 es seguro, 10 es muy riesgoso).
    - "risks": Lista de riesgos potenciales o cláusulas abusivas detectadas.
    - "obligations": Lista de obligaciones principales para el usuario.
    - "recommendation": Recomendación final (Firmar, Negociar, No firmar).
    
    IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON válido, sin markdown ni texto adicional.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(text);

        return new Response(JSON.stringify(analysis), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
