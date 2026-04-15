import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
    id: string;
    role: string;
    subscription_tier?: string;
    tenants?: {
        slug: string;
    } | null;
}

/**
 * Hook to observe the Supabase auth session and associated profile.
 * Centralizes authentication state for the entire app.
 */
export function useSessionObserver() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchingRef = useRef<string | null>(null);

    const fetchProfile = async (userId: string) => {
        if (!userId || fetchingRef.current === userId) return profile;
        
        try {
            fetchingRef.current = userId;
            console.log(`[useSessionObserver] Syncing profile for: ${userId}`);
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(slug)')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('[useSessionObserver] Profile not found, creating one...');
                // Fallback: Create profile if missing
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert([{ id: userId, role: 'user' }])
                    .select('*, tenants(slug)')
                    .single();
                return newProfile;
            }

            return data;
        } catch (error) {
            console.error('[useSessionObserver] Fatal error fetching profile:', error);
            return null;
        } finally {
            fetchingRef.current = null;
        }
    };

    const syncFullSession = async (currentSession: any) => {
        setSession(currentSession);
        if (currentSession?.user) {
            const p = await fetchProfile(currentSession.user.id);
            setProfile(p);
        } else {
            setProfile(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;

        // 1. Initial manual check
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            if (mounted) syncFullSession(initialSession);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log(`[useSessionObserver] Auth Event: ${event}`);
            if (mounted) {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    await syncFullSession(currentSession);
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const user = session?.user || null;
    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';

    return { user, profile, isAdmin, loading };
}
