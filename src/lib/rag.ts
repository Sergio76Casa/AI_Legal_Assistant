import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateEmbedding, generateResponse } from "@/lib/gemini";

export async function processUserQuery(query: string, channel: 'web' | 'telegram', userId?: string) {
    try {
        // 1. Generate embedding for the user query
        const queryEmbedding = await generateEmbedding(query);

        // 2. Search for relevant context in Supabase
        const { data: documents, error } = await supabaseAdmin.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 3,
        });

        if (error) {
            console.error("Vector search error:", error);
            throw new Error("Database error during vector search");
        }

        // 3. Construct the prompt with context
        const contextText = documents
            ?.map((doc: { content: string }) => doc.content)
            .join("\n\n---\n\n") || "";

        const systemPrompt = `
      Actúa como un Consultor Experto en Burocracia, Leyes de Extranjería y Cultura Española.
      Tu misión es ayudar a nuevos residentes (Expats/Minorías) con información precisa y empática.
      
      Usa la siguiente INFORMACIÓN DE CONTEXTO para responder a la pregunta del usuario.
      Si la respuesta no está en el contexto, usa tu conocimiento general pero advierte que es información general y no asesoramiento legal específico.
      Responde en el idioma del usuario (detectado automáticamente).
      Mantén un tono profesional, calmado y claro ("Trust & Clarity").
      
      CONTEXTO:
      ${contextText}
      
      PREGUNTA DEL USUARIO:
      ${query}
    `;

        // 4. Generate Answer
        const answer = await generateResponse(systemPrompt);

        // 5. Log the interaction
        await supabaseAdmin.from("chat_logs").insert({
            user_id: userId || null,
            channel: channel,
            message: query,
            ai_response: answer
        });

        return answer;

    } catch (error) {
        console.error("RAG processing error:", error);
        throw error;
    }
}

