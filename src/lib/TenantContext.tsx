import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    plan_type: string;
    config: any;
}

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
    tenant: null,
    loading: true,
    refreshTenant: async () => { },
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshTenant = async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const path = window.location.pathname.replace(/^\/|\/$/g, '');

            // console.log('Refreshing tenant context...', { token, path });

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.tenant_id) {
                    const { data: tenantData } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profile.tenant_id)
                        .single();

                    if (tenantData) {
                        setTenant(tenantData);
                        setLoading(false);
                        return;
                    }
                }
            }

            // 3. Invitation flow: Fetch tenant based on token
            if (token) {
                const { data: invite, error: inviteError } = await supabase
                    .from('tenant_invitations')
                    .select('*, tenants(id, name, slug, config, plan, plan_type)')
                    .eq('token', token)
                    .maybeSingle();

                if (inviteError) console.error('Invite fetch error:', inviteError);

                const tenantFromInvite = invite?.tenants;
                if (tenantFromInvite) {
                    const finalTenant = Array.isArray(tenantFromInvite) ? tenantFromInvite[0] : tenantFromInvite;
                    if (finalTenant) {
                        setTenant(finalTenant as any);
                        setLoading(false);
                        return;
                    }
                }
            }

            // 4. Public Pages: Fetch tenant based on slug
            if (path && !['login', 'create-org', 'privacy', 'cookies', 'home', 'dashboard', 'join', 'sign'].includes(path.split('/')[0])) {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', path)
                    .maybeSingle();

                if (tenantData) {
                    setTenant(tenantData);
                    setLoading(false);
                    return;
                }
            }

            setTenant(null);
        } catch (error) {
            console.error('Error fetching tenant:', error);
            setTenant(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshTenant();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshTenant();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, loading, refreshTenant }}>
            {children}
        </TenantContext.Provider>
    );
};
