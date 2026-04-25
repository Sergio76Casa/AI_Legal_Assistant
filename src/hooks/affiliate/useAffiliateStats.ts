import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ReferralRecord {
    id: string;
    date: string;
    status: string;
    plan: string;
    commission: number;
}

export const useAffiliateStats = (affiliateId: string | undefined) => {
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
    const [stats, setStats] = useState({
        clicks: 0,
        conversions: 0,
        convRate: 0,
        pendingEarnings: 0,
        totalPaid: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    const fetchDetailedData = useCallback(async () => {
        if (!affiliateId) return;
        setLoading(true);
        try {
            // 1. Fetch Referrals
            const { data: referralsData } = await supabase
                .from('affiliate_referrals')
                .select(`id, created_at, referred_user_id`)
                .eq('affiliate_id', affiliateId)
                .order('created_at', { ascending: false });

            if (referralsData) {
                const enrichedReferrals = await Promise.all(referralsData.map(async (ref) => {
                    const { data: sub } = await supabase
                        .from('subscriptions')
                        .select('tier, status')
                        .eq('user_id', ref.referred_user_id)
                        .maybeSingle();

                    const { data: comms } = await supabase
                        .from('affiliate_commissions')
                        .select('amount')
                        .eq('referral_id', ref.id)
                        .eq('status', 'paid');

                    const totalComm = comms?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

                    return {
                        id: ref.id,
                        date: new Date(ref.created_at).toISOString().split('T')[0],
                        status: sub?.status === 'active' ? 'Activo' : 'Pendiente',
                        plan: sub?.tier || 'free',
                        commission: totalComm
                    };
                }));
                setReferrals(enrichedReferrals);

                // 2. Calculate Stats
                const conversions = referralsData.length;
                
                // TODO: Replace with real 'affiliate_clicks' table once implemented
                const estimatedClicks = Math.max(conversions * 12, 45); 
                
                const { data: paidComms } = await supabase
                    .from('affiliate_commissions')
                    .select('amount')
                    .eq('status', 'paid')
                    .in('referral_id', referralsData.map(r => r.id));

                const { data: pendingComms } = await supabase
                    .from('affiliate_commissions')
                    .select('amount')
                    .eq('status', 'pending')
                    .in('referral_id', referralsData.map(r => r.id));

                const pendingEarnings = pendingComms?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
                const totalPaid = paidComms?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

                setStats({
                    clicks: estimatedClicks,
                    conversions,
                    convRate: estimatedClicks > 0 ? Number(((conversions / estimatedClicks) * 100).toFixed(1)) : 0,
                    pendingEarnings,
                    totalPaid
                });

                // 3. Generate Mock/Aggregated Chart Data (Last 30 days)
                // For now creating a visual trend based on referrals
                const last30Days = Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (5 - i) * 5);
                    const name = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                    return {
                        name,
                        clics: Math.floor(estimatedClicks / 6 * (i + 1) + Math.random() * 20),
                        ventas: Math.floor(conversions / 6 * (i + 1) + Math.random() * 2)
                    };
                });
                setChartData(last30Days);
            }
        } catch (err) {
            console.error('Error fetching affiliate stats:', err);
        } finally {
            setLoading(false);
        }
    }, [affiliateId]);

    useEffect(() => {
        fetchDetailedData();
    }, [fetchDetailedData]);

    return {
        loading,
        stats,
        referrals,
        chartData,
        refreshStats: fetchDetailedData
    };
};
