import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface UsageLimits {
    canPerformAction: boolean;
    currentUsage: number;
    maxAllowed: number;
    tier: string;
    loading: boolean;
}

export const useUsageLimits = (userId: string | null, actionType: 'chat_query' | 'upload_document') => {
    const [limits, setLimits] = useState<UsageLimits>({
        canPerformAction: true,
        currentUsage: 0,
        maxAllowed: -1,
        tier: 'free',
        loading: true,
    });

    useEffect(() => {
        if (!userId) {
            setLimits(prev => ({ ...prev, loading: false }));
            return;
        }

        checkLimits();
    }, [userId, actionType]);

    const checkLimits = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .rpc('can_perform_action', {
                    p_user_id: userId,
                    p_action_type: actionType,
                });

            if (error) throw error;

            if (data && data.length > 0) {
                const result = data[0];
                setLimits({
                    canPerformAction: result.can_perform,
                    currentUsage: result.current_usage,
                    maxAllowed: result.max_allowed,
                    tier: result.tier,
                    loading: false,
                });
            }
        } catch (error) {
            console.error('Error checking limits:', error);
            setLimits(prev => ({ ...prev, loading: false }));
        }
    };

    const incrementUsage = async () => {
        if (!userId) return;

        try {
            await supabase.rpc('increment_usage', {
                p_user_id: userId,
                p_action_type: actionType,
            });

            // Refrescar límites después de incrementar
            await checkLimits();
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    };

    const refresh = () => {
        checkLimits();
    };

    return {
        ...limits,
        incrementUsage,
        refresh,
    };
};
