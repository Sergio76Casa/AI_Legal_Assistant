import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { supabase } from './supabase';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    config: any;
}

interface UserProfile {
    id: string;
    role: string;
    tenant_id?: string;
    subscription_tier?: string;
    tenants?: {
        slug: string;
    } | null;
}

interface TenantContextType {
    tenant: Tenant | null;
    user: any;
    profile: UserProfile | null;
    isAdmin: boolean;
    loading: boolean;
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
    tenant: null,
    user: null,
    profile: null,
    isAdmin: false,
    loading: true,
    refreshTenant: async () => { },
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    
    const refreshingRef = useRef(false);
    const lastSessionIdRef = useRef<string | null>(null);

    const syncFullState = useCallback(async (session: any) => {
        if (refreshingRef.current) return;
        
        try {
            refreshingRef.current = true;
            console.log('[TenantProvider] Syncing state...');
            
            const currentUser = session?.user || null;
            setUser(currentUser);

            // 1. Determine Tenant to load
            let tenantToLoad = null;
            let currentProfileData = null;

            // Priority 1: From Profile (if logged in)
            if (currentUser) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*, tenants(*)')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                currentProfileData = data;
                if (currentProfileData?.tenants) {
                    tenantToLoad = currentProfileData.tenants;
                }
            }

            // Priority 2: From URL Slug (if not already loaded or no profile)
            if (!tenantToLoad) {
                const path = window.location.pathname;
                const pathParts = path.split('/').filter(Boolean);
                const potentialSlug = pathParts[0];

                // Reserved paths that shouldn't be treated as slugs
                const reservedPaths = ['dashboard', 'login', 'create-org', 'documents', 'admin', 'join'];
                
                if (potentialSlug && !reservedPaths.includes(potentialSlug)) {
                    console.log(`[TenantProvider] detected slug in URL: ${potentialSlug}`);
                    const { data: tenantData } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('slug', potentialSlug)
                        .maybeSingle();
                    
                    if (tenantData) {
                        tenantToLoad = tenantData;
                    }
                }
            }

            // Priority 3: Fallback invitation token
            if (!tenantToLoad) {
                const token = new URLSearchParams(window.location.search).get('token');
                if (token) {
                    const { data: invite } = await supabase
                        .from('tenant_invitations')
                        .select('*, tenants(*)')
                        .eq('token', token)
                        .maybeSingle();
                    if (invite?.tenants) tenantToLoad = invite.tenants as any;
                }
            }

            // Sync subscription_tier if missing from profile but present in tenant
            if (currentProfileData && tenantToLoad) {
                // Prioritize tenant plan over individual profile tier if operating under a tenant
                let effectiveTier = tenantToLoad.plan;
                if (!effectiveTier || effectiveTier === 'free') {
                    effectiveTier = currentProfileData.subscription_tier || 'free';
                }
                
                if (currentProfileData.role === 'superadmin' || currentProfileData.role === 'admin') effectiveTier = 'business';
                
                currentProfileData.subscription_tier = effectiveTier;
            } else if (currentProfileData?.role === 'superadmin' || currentProfileData?.role === 'admin') {
                currentProfileData.subscription_tier = 'business';
            }

            setProfile(currentProfileData);
            setTenant(tenantToLoad);
        } catch (error) {
            console.error('[TenantProvider] Fatal sync error:', error);
        } finally {
            setLoading(false);
            refreshingRef.current = false;
        }
    }, []);

    const refreshTenant = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await syncFullState(session);
    }, [syncFullState]);

    useEffect(() => {
        let mounted = true;

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                lastSessionIdRef.current = session?.user?.id || null;
                syncFullState(session);
            }
        });

        // Auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentId = session?.user?.id || null;
            if (currentId !== lastSessionIdRef.current || event === 'SIGNED_OUT') {
                console.log(`[TenantProvider] Session change (${event}): ${currentId}`);
                lastSessionIdRef.current = currentId;
                if (mounted) syncFullState(session);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const isAdmin = 
        user?.email === 'lsergiom76@gmail.com' || 
        profile?.role === 'admin' || 
        profile?.role === 'superadmin';

    return (
        <TenantContext.Provider value={{ 
            tenant, 
            user, 
            profile, 
            isAdmin, 
            loading, 
            refreshTenant
        }}>
            {children}
        </TenantContext.Provider>
    );
};
