import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Configurar Supabase con Service Role para acceso a datos (filtrado manual por ID)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const googleApiKey = process.env.GOOGLE_API_KEY!;
const genAI = new GoogleGenerativeAI(googleApiKey);

interface DocumentChunk {
    content: string;
    metadata: any;
}

export async function POST(req: Request) {
    try {
        if (!googleApiKey) {
            return NextResponse.json({ error: 'GOOGLE_API_KEY is not defined' }, { status: 500 });
        }

        const { message, userId } = await req.json();

        // 1. Generar Embedding de la consulta
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(message);
        const embedding = embeddingResult.embedding.values;

        // 2. Recuperar contexto relevante (RAG)
        let contextText = "";

        if (userId) {
            const { data: documents, error } = await supabase.rpc('match_knowledge', {
                query_embedding: embedding,
                match_threshold: 0.5, // Umbral de similitud
                match_count: 5,       // Número de fragmentos a recuperar
                filter_user_id: userId
            });

            if (error) {
                console.error("Error retrieving context:", error);
            } else if (documents && documents.length > 0) {
                contextText = documents.map((doc: DocumentChunk) => doc.content).join("\n\n---\n\n");
            }
        }

        // 3. Construir Prompt del Sistema con Contexto
        const systemPrompt = `
Eres un asistente legal experto en normativa española y cumplimiento Halal/Islámico.
Tu objetivo es ayudar a inmigrantes y miembros de la comunidad musulmana con trámites de extranjería, contratos y dudas legales.

CONTEXTO RECUPERADO DE DOCUMENTOS DEL USUARIO:
${contextText ? contextText : "No se encontró contexto específico en los documentos del usuario."}

INSTRUCCIONES:
- Usa el contexto proporcionado para responder si es relevante.
- Si la respuesta está en el contexto, cítalo explícitamente.
- Si no tienes información en el contexto, responde usando tu conocimiento general pero advierte que es información general y no basada en sus documentos.
- Mantén un tono profesional, empático y claro.
- Respuesta en formato Markdown limpio.
`;

        // 4. Generar Respuesta con Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            answer: text
        });

    } catch (error) {
        console.error('Error in chat generation:', error);
        return NextResponse.json({ error: "Error en el procesamiento de la solicitud." }, { status: 500 });
    }
}
