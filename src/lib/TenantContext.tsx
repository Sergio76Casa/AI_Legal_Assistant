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
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setTenant(null);
                setLoading(false);
                return;
            }

            // 1. Get tenant_id from profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single();

            if (profile?.tenant_id) {
                // 2. Get full tenant details
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                setTenant(tenantData);
            } else {
                // Fallback / Error state
                setTenant(null);
            }
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
