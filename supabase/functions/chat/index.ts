import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const text = await req.text();
        if (!text) throw new Error("Cuerpo vacío.");

        const body = JSON.parse(text);
        const { query, lang, user_id } = body;
        if (!query) throw new Error("Query missing.");

        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
        const genAI = new GoogleGenerativeAI(apiKey!);

        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });
        const embResult = await embeddingModel.embedContent(query);
        const embedding = embResult.embedding.values;

        const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');

        console.log(`Querying match_documents for user: ${user_id || 'null'}`);

        // Fetch user's tenant_id
        let tenant_id = '00000000-0000-0000-0000-000000000000';
        if (user_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user_id)
                .single();
            if (profile?.tenant_id) {
                tenant_id = profile.tenant_id;
            }
        }
        console.log(`Detected Tenant ID: ${tenant_id}`);

        const { data: documents, error: rpcError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 5,
            p_user_id: user_id || null,
            p_tenant_id: tenant_id
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError.message);
        } else {
            console.log(`Found ${documents?.length || 0} matching documents.`);
            documents?.forEach((d: any, i: number) => {
                console.log(`Doc ${i}: ${d.title} (Similarity: ${d.similarity})`);
            });
        }

        const contextText = documents?.length
            ? documents.map((d: any) => {
                const type = d.metadata?.source?.includes(user_id) ? 'DOCUMENTO DE USUARIO' : 'GUÍA GLOBAL';
                return `[${type}: ${d.title}]\n${d.content}`;
            }).join('\n\n')
            : 'Sin contexto relevante.';

        const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1beta' });
        const result = await chatModel.generateContent(`Eres STARK, tu Aliado Legal Inteligente y Experto en Vivir en España. 🇪🇸⚖️
Tu misión es simplificar la burocracia, eliminar el estrés legal y asegurar que el usuario se sienta acompañado y entendido.

IDIOMA: ${lang || 'es'}.

TUS SUPERPODERES:
1. **Claridad Total**: Explicas leyes complejas con lenguaje sencillo y ejemplos cotidianos. Nada de "abogado-ñol".
2. **Concisión Extrema**: Ve al grano. **NO** saludes con párrafos largos. **NO** repitas la pregunta. Usa frases cortas.
3. **Estructura Visual**: Usa SIEMPRE **bullet points** (listas) para enumerar pasos o requisitos. Evita bloques de texto de más de 3 líneas.

ESTRUCTURA DE TU RESPUESTA:
1. **🚀 Respuesta Directa**: Empieza con la solución inmediata en 1 frase.
2. **📝 Pasos Clave / Requisitos**:
   * Punto 1
   * Punto 2
   * Punto 3
3. **🔍 Análisis de Documentos (Si aplica)**: Si encuentras información específica en el CONTEXTO, úsala: "He visto en tu contrato que...".
4. **💡 Consejo STARK**: 1 línea con un tip proactivo o advertencia importante.

REGLAS DE ORO:
- **Privacidad**: Si el contexto tiene datos sensibles, úsalos SOLO si es necesario.
- **Contexto vs. Conocimiento**: Prioriza la información del CONTEXTO. Si no hay contexto, usa tu conocimiento general sobre España.
- **Halal Friendly**: Ten en cuenta normas Halal si aplica.
- **Honestidad**: Si no sabes un dato privado, dilo.

DATOS DE REFERENCIA 'FLASH' (ESPAÑA 2025):
- **Arraigo Social**: 2 años estancia.
- **Nacionalidad**: 10 años (general), 2 (Iberoamérica).
- **Vivienda**: Fianza legal = 1 mes. Honorarios inmobiliaria paga el casero.

CONTEXTO RECUPERADO (Tus documentos y guías oficiales):
${contextText}

PREGUNTA DEL USUARIO:
${query}`);

        const response = await result.response;
        const responseText = response.text();

        return new Response(JSON.stringify({
            answer: responseText,
            sources: documents?.map((d: any) => d.title || 'Documento') || []
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
})
