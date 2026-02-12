import { NextRequest, NextResponse } from "next/server";
import { processUserQuery } from "@/lib/rag";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        let userId = null;
        let isPremium = false;
        let queryCount = 0;

        if (token) {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && user) {
                userId = user.id;

                // Check profile limits
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('subscription_tier, query_counter')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    queryCount = profile.query_counter || 0;
                    isPremium = profile.subscription_tier === 'premium';

                    // Enforce Limit for Free users
                    if (!isPremium && queryCount >= 3) {
                        return NextResponse.json({
                            error: "Limit reached",
                            code: "LIMIT_REACHED"
                        }, { status: 403 });
                    }
                }
            }
        }

        // Process Query
        const answer = await processUserQuery(message, 'web');
        let finalResponse = answer;
        let isTeaser = false;

        // Teaser Logic for non-logged in users
        if (!userId) {
            isTeaser = true;
            // Truncate to 40% roughly or defined characters
            // Let's take first 200 chars or first paragraph
            finalResponse = answer.slice(0, 300);
        } else {
            // Increment query count for logged in users
            await supabaseAdmin
                .from('profiles')
                .update({ query_counter: queryCount + 1 })
                .eq('id', userId);
        }

        return NextResponse.json({ response: finalResponse, isTeaser });

    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Unknown error",
            details: JSON.stringify(error)
        }, { status: 500 });
    }
}
