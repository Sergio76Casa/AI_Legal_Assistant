import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'pt', 'ar', 'ru', 'bm', 'wo', 'ur', 'zh'];

// List of allowed Lucide icon names to ensure AI picks a valid one
const ALLOWED_ICONS = ['FileText', 'ShieldCheck', 'Globe', 'Building', 'HelpCircle', 'Info', 'Scale', 'Scroll', 'FileDigit', 'Briefcase', 'MessageSquare', 'Zap'];

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { title, content, sourceLang } = await req.json();
        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
        if (!apiKey) throw new Error("Missing GOOGLE_API_KEY_CHAT");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
            You are a professional translator and UX designer for a legal assistance platform.
            
            1. AUTO-DETECT the source language of the provided TITLE and CONTENT.
            2. Translate them into these languages: ${SUPPORTED_LANGUAGES.join(', ')}.
            3. Based on the meaning, select the most relevant icon from this list: ${ALLOWED_ICONS.join(', ')}.

            Title: "${title}"
            Content: "${content}"

            REQUIREMENTS:
            - Maintain a professional, legal, and helpful tone.
            - Return ONLY a valid JSON object with this exact structure:
            {
                "icon": "IconName",
                "translations": {
                    "es": { "title": "...", "content": "..." },
                    "en": { "title": "...", "content": "..." },
                    ...
                }
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
