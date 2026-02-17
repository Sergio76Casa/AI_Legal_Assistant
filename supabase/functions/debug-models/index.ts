import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

Deno.serve(async (req) => {
    try {
        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') ?? '')
        // Note: The SDK doesn't have a direct listModels method that is easy to call here without more setup
        // But we can try to use a model we think exists or use a fetch call to the Google API

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${Deno.env.get('GOOGLE_API_KEY')}`)
        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
