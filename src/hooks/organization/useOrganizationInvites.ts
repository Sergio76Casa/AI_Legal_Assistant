import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface Invitation {
    id: string;
    email: string;
    status: string;
    expires_at: string;
    [key: string]: any;
}

export const useOrganizationInvites = (tenantId: string | undefined) => {
    const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, token?: string } | null>(null);

    const fetchPendingInvitations = useCallback(async () => {
        if (!tenantId) return;
        setLoadingInvites(true);
        try {
            const { data, error } = await supabase
                .from('tenant_invitations')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('status', 'pending');

            if (error) throw error;
            setPendingInvitations(data || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        } finally {
            setLoadingInvites(false);
        }
    }, [tenantId]);

    const handleInvite = async (email: string) => {
        if (!tenantId) return;
        setStatus(null);
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email,
                    tenant_id: tenantId,
                    role: 'user'
                }
            });

            if (error) throw error;

            if (data.error) {
                if (data.error === 'ERROR_FORBIDDEN') throw new Error('No tienes permisos suficientes para invitar miembros.');
                if (data.error === 'ERROR_ALREADY_MEMBER') throw new Error('Este usuario ya es miembro de la organización.');
                throw new Error(data.error);
            }

            setStatus({
                type: 'success',
                message: 'Invitación creada correctamente',
                token: data.invite_token
            });
            fetchPendingInvitations();
            return { success: true };
        } catch (error: any) {
            console.error('Invite error:', error);
            const errMsg = error.message || 'Error al invitar al usuario';
            setStatus({ type: 'error', message: errMsg });
            return { success: false, error: errMsg };
        }
    };

    const handleDeleteInvitation = async (id: string) => {
        try {
            const { error } = await supabase
                .from('tenant_invitations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPendingInvitations(prev => prev.filter(inv => inv.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting invitation:', error);
            return { success: false };
        }
    };

    return {
        pendingInvitations,
        loadingInvites,
        status,
        setStatus,
        fetchPendingInvitations,
        handleInvite,
        handleDeleteInvitation
    };
};
