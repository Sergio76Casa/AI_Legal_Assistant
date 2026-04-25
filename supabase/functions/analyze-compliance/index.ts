import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { asset_id, language = 'es' } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT')
        const genAI = new GoogleGenerativeAI(apiKey!)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // 1. Obtener datos del activo y sus analíticas
        const { data: asset, error: assetError } = await supabase
            .from('electrical_assets')
            .select('*, energy_analytics(*)')
            .eq('id', asset_id)
            .single()

        if (assetError) throw assetError

        const now = new Date()
        const isOcaExpired = asset.oca_expiry ? new Date(asset.oca_expiry) < now : false
        const isCieExpired = asset.cie_expiry ? new Date(asset.cie_expiry) < now : false
        
        const analytics = asset.energy_analytics?.[0] || {}

        // 2. Construir el Prompt
        const prompt = `
            Eres el Experto en Eficiencia Stark de "Legal AI Global". 
            Tu misión es analizar el estado de cumplimiento legal y eficiencia energética del siguiente activo industrial.
            
            DATOS DEL ACTIVO:
            - Nombre: ${asset.name}
            - CUPS: ${asset.cups}
            - OCA Caducada: ${isOcaExpired ? 'SÍ' : 'NO'} (${asset.oca_expiry || 'N/A'})
            - CIE (Boletín) Caducado: ${isCieExpired ? 'SÍ' : 'NO'} (${asset.cie_expiry || 'N/A'})
            - Insight previo IA: ${analytics.ai_insight || 'Ninguno'}
            - Ahorro potencial detectado: ${analytics.potential_savings || 0}€ mensual
            
            REQUISITOS DEL INFORME:
            1. Idioma: DEBES escribir el informe TODO en el idioma: ${language}.
            2. Estilo: Profesional, directo, marca "Legal AI Global".
            3. Estructura:
               - SECCIÓN 1: CUMPLIMIENTO LEGAL. Explica la gravedad de tener la OCA o el CIE caducado si corresponde (multas, cierres, riesgos).
               - SECCIÓN 2: OPTIMIZACIÓN ECONÓMICA. Detalla el ahorro potencial de ${analytics.potential_savings || 0}€ y la acción necesaria.
            4. Formato: Usa Markdown (negritas, listas).
            
            Genera solo el contenido del informe.
        `

        const result = await model.generateContent(prompt)
        const recommendation = result.response.text()

        return new Response(
            JSON.stringify({ recommendation }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (e: any) {
        return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
