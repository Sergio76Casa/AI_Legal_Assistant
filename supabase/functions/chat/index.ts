import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        console.log("--- INICIO PETICIÓN CHAT ---");
        const text = await req.text();
        if (!text) throw new Error("Cuerpo de petición vacío.");

        let body;
        try {
            body = JSON.parse(text);
        } catch (jErr) {
            throw new Error("El cuerpo de la petición no es JSON válido.");
        }

        const { query, lang, user_id, history = [] } = body;
        if (!query) throw new Error("Parámetro 'query' faltante en la petición.");

        console.log(`[FASE 0] Input: "${query.substring(0,30)}..." | Historial: ${history?.length || 0}`);

        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
        if (!apiKey) throw new Error("Configuración de IA incompleta (Falta API Key).");

        const genAI = new GoogleGenerativeAI(apiKey);
        let embedding: number[] = [];

        // 1. Vectorizar la pregunta via REST API directa (gemini-embedding-001 = 3072 dims en v1beta)
        try {
            console.log("[FASE 1] Vectorizando...");
            const embRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: { parts: [{ text: query }] } })
                }
            );
            const embData = await embRes.json();
            if (!embRes.ok) throw new Error(embData?.error?.message || JSON.stringify(embData));
            embedding = embData.embedding?.values || [];
            if (!embedding.length) throw new Error("Vector vacío retornado por Gemini.");
            console.log(`[FASE 1 OK] Embedding generado (${embedding.length} dims).`);
        } catch (embErr: any) {
            console.error("[FASE 1 ERROR]:", embErr.message);
            throw new Error(`Fallo IA Text Embedding: ${embErr.message}`);
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        // 2. Obtener tenant
        let tenant_id = '00000000-0000-0000-0000-000000000000';
        let tenantInfo = null;
        if (user_id) {
            try {
                const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user_id).single();
                if (profile?.tenant_id) {
                    tenant_id = profile.tenant_id;
                    if (tenant_id !== '00000000-0000-0000-0000-000000000000') {
                        const { data: tData } = await supabase.from('tenants').select('name, config').eq('id', tenant_id).single();
                        tenantInfo = tData;
                    }
                }
            } catch (ignore) { /* fail silent */ }
        }

        // 3. Buscar documentos relevantes
        let documents: any[] = [];
        try {
            console.log("[FASE 3] Exec RPC match_documents...");
            const { data, error: rpcError } = await supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.1,
                match_count: 5,
                p_user_id: user_id || null,
                p_tenant_id: tenant_id || null
            }).select('*').limit(5);

            if (rpcError) throw new Error(rpcError.message || JSON.stringify(rpcError));

            documents = Array.isArray(data) ? data.slice(0, 5) : [];
            console.log(`[FASE 3 OK] Recuperados ${documents.length} bloques.`);
        } catch (rpcErr: any) {
            console.error("[FASE 3 LOG DE ERROR DB]:", rpcErr.message);
            documents = [];
        }

        // 4. Ensamblar contexto y preparar Gemini
        const contextText = documents.length > 0
            ? documents.filter(d => d && d.content).map((d: any) =>
                `[FUENTE: ${d.title || 'Sin Título'}]\n${d.content}`
            ).join('\n\n')
            : 'Sin contexto relevante.';

        const systemInstruction = `Eres STARK, Aliado Legal Inteligente.
${tenantInfo?.name ? `Oficina: ${tenantInfo.name}` : ''}
Usa Bullet Points. Responde claro y conciso.
CONTEXTO EXTRAÍDO:
${contextText}`;

        const chatModel = genAI.getGenerativeModel(
            { model: 'gemini-2.0-flash', systemInstruction },
            { apiVersion: 'v1beta' }
        );

        // 5. Historial seguro
        const recentHistory = (Array.isArray(history) ? history : [])
            .filter((m: any) => m && m.id !== '1' && typeof m.content === 'string' && m.content.trim())
            .slice(-8);

        const geminiHistory = [];
        for (const msg of recentHistory) {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === role) {
                geminiHistory[geminiHistory.length - 1].parts[0].text += '\n' + msg.content;
            } else {
                geminiHistory.push({ role, parts: [{ text: msg.content }] });
            }
        }

        if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
            geminiHistory.shift();
        }

        // 6. Generar con reintentos (backoff exponencial para 429/500/503)
        try {
            console.log("[FASE 5] Generando con Gemini...");
            const chat = chatModel.startChat({ history: geminiHistory });

            let responseText = "";
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    const result = await chat.sendMessage(query);
                    responseText = await result.response.text();
                    break;
                } catch (retryErr: any) {
                    attempts++;
                    const errMsg = String(retryErr.message);
                    if (attempts < maxAttempts && (errMsg.includes("429") || errMsg.includes("500") || errMsg.includes("503"))) {
                        const waitTime = 5000 * attempts;
                        console.warn(`[FASE 5 AVISO] Error temporal. Intento ${attempts}/${maxAttempts}. Esperando ${waitTime/1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    } else {
                        throw retryErr;
                    }
                }
            }

            console.log("[FASE 5 OK] Inferencia completada.");

            const cleanSources = documents.length > 0 ? documents.map((d: any) => ({
                title: d?.title || 'Documento Legal',
                similarity: Math.round(((d?.similarity || 0) * 100))
            })) : [];

            return new Response(JSON.stringify({
                answer: responseText,
                sources: cleanSources
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } catch (infErr: any) {
            console.error("[FASE 5 ERROR GEMINI]:", infErr.message);
            throw new Error(`Error en Generación IA: ${infErr.message}`);
        }

    } catch (e: any) {
        console.error("=== 500 FATAL ERROR ===", e.message);
        return new Response(JSON.stringify({
            error: e.message,
            cause: "Check Supabase Dashboard (Edge Functions -> Logs)."
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
