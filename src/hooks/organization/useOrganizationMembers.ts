import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface Member {
    id: string;
    email: string;
    role: string;
    subscription_tier: string;
    tier: string;
    joinedViaInvite: boolean;
    [key: string]: any;
}

export const useOrganizationMembers = (tenantId: string | undefined) => {
    const [users, setUsers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;

            const userIds = (profiles || []).map(u => u.id);

            const { data: acceptedInvites } = await supabase
                .from('tenant_invitations')
                .select('email')
                .eq('tenant_id', tenantId)
                .eq('status', 'accepted');

            const acceptedEmailsSet = new Set((acceptedInvites || []).map(inv => inv.email));

            const { data: subsData } = await supabase
                .from('subscriptions')
                .select('user_id, tier')
                .in('user_id', userIds);

            const subsMap = new Map((subsData || []).map(s => [s.user_id, s.tier]));

            const usersWithMeta = (profiles || []).map(u => {
                const internalTier = subsMap.get(u.id) || u.subscription_tier || 'free';
                const mappedTier = (internalTier === 'pro' || internalTier === 'business') ? 'premium' : internalTier;

                return {
                    ...u,
                    joinedViaInvite: acceptedEmailsSet.has(u.email),
                    tier: mappedTier
                } as Member;
            });

            setUsers(usersWithMeta);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const handleUpdatePlan = async (userId: string, newTier: string) => {
        setUpdatingPlan(userId);
        try {
            const { data, error } = await supabase.rpc('update_member_tier', {
                p_member_id: userId,
                p_new_tier: newTier
            });

            if (error) throw error;
            if (data && data.success === false) throw new Error(data.error);

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
            return { success: true };
        } catch (error: any) {
            console.error('Error updating plan:', error);
            return { success: false, error: error.message };
        } finally {
            setUpdatingPlan(null);
        }
    };

    const logActivity = async (action: string, details: string, metadata: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && tenantId) {
                await supabase.from('activity_logs').insert({
                    tenant_id: tenantId,
                    user_id: user.id,
                    action_type: action,
                    details: details,
                    metadata: metadata
                });
            }
        } catch (err) {
            console.error('Error logging activity:', err);
        }
    };

    return {
        users,
        loading,
        updatingPlan,
        fetchUsers,
        handleUpdatePlan,
        logActivity
    };
};
