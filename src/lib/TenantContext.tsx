import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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

    const syncFullState = async (session: any) => {
        if (refreshingRef.current) return;
        
        try {
            refreshingRef.current = true;
            console.log('[TenantProvider] Syncing state...');
            
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (!currentUser) {
                setProfile(null);
                setTenant(null);
                setLoading(false);
                return;
            }

            // 1. Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, tenants(slug)')
                .eq('id', currentUser.id)
                .maybeSingle();

            setProfile(profileData);

            // 2. Fetch Tenant
            if (profileData?.tenant_id) {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profileData.tenant_id)
                    .maybeSingle();
                setTenant(tenantData);
            } else {
                // Fallback: Check for invitation token if no tenant yet
                const token = new URLSearchParams(window.location.search).get('token');
                if (token) {
                    const { data: invite } = await supabase
                        .from('tenant_invitations')
                        .select('*, tenants(*)')
                        .eq('token', token)
                        .maybeSingle();
                    if (invite?.tenants) setTenant(invite.tenants as any);
                } else {
                    setTenant(null);
                }
            }
        } catch (error) {
            console.error('[TenantProvider] Fatal sync error:', error);
        } finally {
            setLoading(false);
            refreshingRef.current = false;
        }
    };

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

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';

    return (
        <TenantContext.Provider value={{ 
            tenant, 
            user, 
            profile, 
            isAdmin, 
            loading, 
            refreshTenant: () => syncFullState(null) // Generic refresh
        }}>
            {children}
        </TenantContext.Provider>
    );
};
