import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
    try {
        const update = await req.json();

        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;

            // 1. Identify User (Optional: Link Telegram ID to Supabase User)
            // For now, we will just answer anonymously or use a system prompt.

            // 2. Generate Answer with Gemini
            const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '');
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: "Eres un asistente legal islámico útil y conciso en Telegram. Responde preguntas sobre extranjería y Halal."
            });

            const result = await model.generateContent(text);
            const response = await result.response;
            const answer = response.text();

            // 3. Send Reply to Telegram
            const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: answer,
                    parse_mode: 'Markdown'
                })
            });
        }

        return new Response('ok', { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
