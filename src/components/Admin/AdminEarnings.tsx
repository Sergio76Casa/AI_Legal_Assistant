import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { EarningsKPIs } from './EarningsKPIs';
import { EarningsCharts } from './EarningsCharts';
import { AffiliateRanking } from './AffiliateRanking';
import { TransactionMonitor } from './TransactionMonitor';

interface AdminStats {
    mrr: number;
    netProfit: number;
    affiliateCost: number;
    activeAffiliates: number;
}

const mockChartData = [
    { month: 'Dic', ingresos: 12500, beneficio: 10100 },
    { month: 'Ene', ingresos: 15400, beneficio: 12800 },
    { month: 'Feb', ingresos: 18900, beneficio: 15340 },
];

export const AdminEarnings: React.FC = () => {
    const [stats, setStats] = useState<AdminStats>({
        mrr: 0,
        netProfit: 0,
        affiliateCost: 0,
        activeAffiliates: 0
    });
    const [topAffiliates, setTopAffiliates] = useState<any[]>([]);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFinancialData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Subscriptions to calculate MRR
                const { data: subs } = await supabase.from('subscriptions').select('tier, status');
                let businessMrr = 0;
                subs?.forEach(s => {
                    if (s.tier === 'business' && s.status === 'active') businessMrr += 149;
                });

                // 2. Fetch Commissions & Active Affiliates
                const { data: commissions } = await supabase
                    .from('affiliate_commissions')
                    .select('amount, referral_id(affiliate_id)');

                const totalComm = commissions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
                const activeAffIds = new Set(commissions?.map(c => (c.referral_id as any)?.affiliate_id) || []);

                setStats({
                    mrr: businessMrr,
                    affiliateCost: totalComm,
                    netProfit: businessMrr - totalComm,
                    activeAffiliates: activeAffIds.size || 0
                });

                // 3. Fetch Top 3 Affiliates
                const { data: topAffs } = await supabase
                    .from('affiliates')
                    .select('*, profiles(username, full_name)')
                    .order('total_earned', { ascending: false })
                    .limit(3);
                setTopAffiliates(topAffs || []);

                // 4. Recent Payments
                const { data: recPayments } = await supabase
                    .from('affiliate_commissions')
                    .select('*, referral_id(affiliate_id(affiliate_code), referred_user_id(profiles(full_name)))')
                    .order('created_at', { ascending: false })
                    .limit(6);
                setRecentPayments(recPayments || []);

            } catch (err) {
                console.error('Error loading earnings data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFinancialData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-slate-400 font-medium italic">Sincronizando balances financieros...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <EarningsKPIs stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <EarningsCharts data={mockChartData} />
                <AffiliateRanking topAffiliates={topAffiliates} />
            </div>

            <TransactionMonitor payments={recentPayments} />
        </div>
    );
};
