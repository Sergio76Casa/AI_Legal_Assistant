import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
    try {
        const update = await req.json()

        if (!update.message || !update.message.text) {
            return new Response('ok')
        }

        const chatId = update.message.chat.id
        const userText = update.message.text

        // Initialize clients
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!)

        // 1. RAG Pipeline Multi-Nivel (En Telegram asumimos que es público por ahora, a menos que sincronicemos perfiles)
        // Usamos embedding-004 que es el modelo que estamos estandarizando
        const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })
        const embeddingResult = await embeddingModel.embedContent({
            content: { parts: [{ text: userText }] },
            taskType: 'RETRIEVAL_QUERY',
            outputDimensionality: 768
        })

        const { data: documents } = await supabase.rpc('match_documents', {
            query_embedding: embeddingResult.embedding.values,
            match_threshold: 0.15,
            match_count: 5,
            p_user_id: null, // Por ahora Telegram solo busca en leyes globales. En el futuro podemos vincular telegram_id con profile.id
            p_tenant_id: null // Búsqueda global (o tenant por defecto si lo hubiera)
        })

        const contextText = documents?.map((doc: any) => doc.content).join('\n---\n') || ''

        // 2. Generación con Fallback
        const systemPrompt = `Eres STARK. Responde conciso para Telegram usando este contexto: ${contextText}\n\nPregunta: ${userText}`

        const modelsToTry = [
            'gemini-2.0-flash',
            'gemini-1.5-flash'
        ]

        let responseText = "⚠️ Problemas técnicos con Google. Reintente luego."

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent(systemPrompt)
                responseText = result.response.text()
                break
            } catch (err) { continue }
        }

        await sendTelegramMessage(chatId, responseText)

        return new Response('ok')

    } catch (error) {
        console.error('Error in bot:', error)
        return new Response('error', { status: 500 })
    }
})

async function sendTelegramMessage(chatId: string | number, text: string) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
    })
}
