import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyDvsanf_u8RzbydbHqVT2b5iQ69ZWV84Dg";

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("Available Chat Models (1.5):");
        const chatModels = data.models.filter(m => m.name.includes("1.5") && m.supportedGenerationMethods.includes("generateContent"));
        console.log(JSON.stringify(chatModels.map(m => m.name), null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
