import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to manage tenants and their users for Legal AI Global.
 */
export function useTenantControl() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [tenantUsers, setTenantUsers] = useState<any[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
    const [updatingUserPlan, setUpdatingUserPlan] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchTenants = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('[useTenantControl] fetched tenants:', data?.length);
            setTenants(data || []);
        } catch (error: any) {
            console.error('Error fetching tenants:', error);
            setStatus({ type: 'error', message: 'Error cargando organizaciones: ' + error.message });
        }
    }, []);

    const fetchTenantUsers = useCallback(async (tenantId: string) => {
        setIsLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;
            setTenantUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching tenant users:', error);
            setStatus({ type: 'error', message: 'Error cargando usuarios: ' + error.message });
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    const handleUpdatePlan = async (tenantId: string, newPlan: string) => {
        setUpdatingPlan(tenantId);
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ plan: newPlan })
                .eq('id', tenantId);

            if (error) throw error;

            setStatus({ type: 'success', message: '¡Plan actualizado con éxito en Legal AI Global!' });
            fetchTenants();
        } catch (error: any) {
            console.error('Error updating plan:', error);
            setStatus({ type: 'error', message: 'Error al actualizar plan: ' + error.message });
        } finally {
            setUpdatingPlan(null);
        }
    };

    const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
        setUpdatingUserPlan(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_tier: newPlan })
                .eq('id', userId);

            if (error) throw error;

            setStatus({ type: 'success', message: '¡Suscripción de usuario actualizada!' });
            
            // Re-fetch users if we have a selected tenant
            setTenantUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_tier: newPlan } : u));
            
        } catch (error: any) {
            console.error('Error updating user plan:', error);
            setStatus({ type: 'error', message: 'Error actualizar usuario: ' + error.message });
        } finally {
            setUpdatingUserPlan(null);
        }
    };

    return {
        tenants,
        tenantUsers,
        selectedTenant,
        setSelectedTenant,
        isLoadingUsers,
        updatingPlan,
        updatingUserPlan,
        status,
        setStatus,
        fetchTenants,
        fetchTenantUsers,
        handleUpdatePlan,
        handleUpdateUserPlan
    };
}
