"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Profile {
    id: string;
    email: string;
    subscription_tier: 'free' | 'premium';
    query_counter: number;
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialQuery: string;
    setInitialQuery: (query: string) => void;
    user: User | null;
    profile: Profile | null;
    isLoadingAuth: boolean;
    refreshProfile: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const refreshProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) setProfile(data as Profile);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsLoadingAuth(false);
            if (session?.user) {
                // Fetch profile
                supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
                    if (data) setProfile(data as Profile);
                });
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (data) setProfile(data as Profile);
            } else {
                setProfile(null);
            }
            setIsLoadingAuth(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Refresh profile when user changes or specifically called
    useEffect(() => {
        if (user) {
            refreshProfile();
        }
    }, [user]);

    return (
        <ChatContext.Provider value={{
            isOpen, setIsOpen,
            initialQuery, setInitialQuery,
            user, profile, isLoadingAuth,
            refreshProfile
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
