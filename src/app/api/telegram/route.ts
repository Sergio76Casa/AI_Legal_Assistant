import { NextRequest, NextResponse } from "next/server";
import { processUserQuery } from "@/lib/rag";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(chatId: number, text: string) {
    try {
        await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" }),
        });
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();

        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const userId = update.message.from?.id?.toString();

            // Send "typing" action
            await fetch(`${TELEGRAM_API_URL}/sendChatAction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, action: "typing" }),
            });

            // Process with RAG
            const answer = await processUserQuery(text, 'telegram', userId);

            // Reply to user
            await sendTelegramMessage(chatId, answer);
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
