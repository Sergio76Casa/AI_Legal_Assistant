import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
        const { text, imageUrl } = await req.json();

        if (!text && !imageUrl) {
            return new Response(JSON.stringify({ error: "Missing text or imageUrl" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `Actúa como un experto certificador Halal. Analiza la siguiente información de un producto alimenticio o financiero y determina si es HALAL, HARAM o MUSHBOOH (Dudoso).`;
        let parts: any[] = [];

        if (text) {
            prompt += `\n\nINGREDIENTES / DESCRIPCIÓN:\n${text}`;
            parts.push({ text: prompt });
        }

        // Note: Gemini 1.5 Flash supports image inputs, but handling image URL fetching inside Edge Function 
        // requires downloading the image first and converting to base64 or passing as inline data if supported by the SDK version used in Deno.
        // For simplicity, we will assume text input primarily or strict URL analysis if the model supports it (Vision).
        // The current @google/generative-ai SDK usually expects base64 or file parts for images.

        if (imageUrl) {
            prompt += `\n\nAnaliza la imagen en esta URL (si puedes acceder) o sus metadatos: ${imageUrl}`;
            // In a real scenario, we'd fetch the image buffer here and convert to base64.
            parts.push({ text: prompt });
        }

        prompt += `\n\nResponde en formato JSON estrictamente:
    {
        "status": "HALAL" | "HARAM" | "MUSHBOOH",
        "reasoning": "Explicación detallada de por qué",
        "ingredients_analysis": ["Lista de ingredientes problemáticos si los hay"],
        "certification_likelihood": "Alta" | "Media" | "Baja"
    }`;

        const result = await model.generateContent(parts);
        const response = await result.response;
        let responseText = response.text();

        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(responseText);

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
