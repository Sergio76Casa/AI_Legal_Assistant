import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'user';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
    tenant_id?: string;
    tenants?: {
        slug: string;
    };
}

/**
 * Hook to manage the authentication session and user profile for Legal AI Global.
 */
export function useSessionObserver() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const lastSlugRef = useRef<string | null>(null);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, tenants(slug)')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            
            setProfile(data);
            if (data?.tenants?.slug) {
                lastSlugRef.current = data.tenants.slug;
            }
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        user,
        profile,
        loading,
        lastSlug: lastSlugRef.current,
        isAdmin: user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin',
        refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(null)
    };
}
