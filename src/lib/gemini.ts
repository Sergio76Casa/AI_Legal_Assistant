import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Model for embeddings
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// Model for chat/generation
const chatModel = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    generationConfig: {
        temperature: 0.1, // High precision
    }
});

export async function generateEmbedding(text: string): Promise<number[]> {
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
}

export async function generateResponse(prompt: string): Promise<string> {
    const result = await chatModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
