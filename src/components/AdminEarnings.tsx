import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    Users,
    ArrowUpRight,
    CreditCard,
    ArrowRight,
    Crown,
    Activity,
    BarChart3
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { cn } from '../lib/utils';

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

    useEffect(() => {
        const loadFinancialData = async () => {
            try {
                // 1. Fetch Subscriptions to calculate MRR (Business only)
                const { data: subs } = await supabase.from('subscriptions').select('tier, status');

                let businessMrr = 0;
                subs?.forEach(s => {
                    if (s.tier === 'business' && s.status === 'active') businessMrr += 149;
                });

                // 2. Fetch Commissions & Active Affiliates
                const { data: commissions } = await supabase
                    .from('affiliate_commissions')
                    .select('amount, status, referral_id(affiliate_id)');

                const totalComm = commissions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

                // Get unique active affiliates (at least one referral in commissions or referrals table)
                const activeAffIds = new Set(commissions?.map(c => (c.referral_id as any)?.affiliate_id) || []);

                setStats({
                    mrr: businessMrr,
                    affiliateCost: totalComm,
                    netProfit: businessMrr - totalComm,
                    activeAffiliates: activeAffIds.size || 0
                });

                // 3. Fetch Top 3 Affiliates (as requested)
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
                console.error(err);
            }
        };

        loadFinancialData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'MRR (Business)',
                        value: `${stats.mrr.toLocaleString('es-ES')}€`,
                        sub: 'Solo suscripciones activas',
                        icon: DollarSign,
                        color: 'text-[#13ecc8]',
                        bg: 'bg-[#13ecc8]/5'
                    },
                    {
                        label: 'Beneficio Neto Real',
                        value: `${stats.netProfit.toLocaleString('es-ES')}€`,
                        sub: `Comprometido: ${stats.affiliateCost}€`,
                        icon: Activity,
                        color: 'text-blue-400',
                        bg: 'bg-blue-400/5'
                    },
                    {
                        label: 'Afiliados Activos',
                        value: stats.activeAffiliates.toString(),
                        sub: 'Partners con ingresos',
                        icon: Users,
                        color: 'text-amber-400',
                        bg: 'bg-amber-400/5'
                    },
                    {
                        label: 'Simulación Actual',
                        value: '129.80€',
                        sub: 'Reflejado en Beneficio',
                        icon: TrendingUp,
                        color: 'text-rose-400',
                        bg: 'bg-rose-400/5'
                    },
                ].map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all"
                    >
                        <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12", kpi.bg.replace('bg-', 'bg-'))}></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn("p-4 rounded-2xl border border-white/5", kpi.bg)}>
                                    <kpi.icon size={24} className={kpi.color} />
                                </div>
                                <ArrowUpRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{kpi.label}</h3>
                                <div className="text-4xl font-black text-white tracking-tighter mb-2">{kpi.value}</div>
                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <TrendingUp size={12} className="text-[#13ecc8]" />
                                    {kpi.sub}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 2. Chart & Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-[#13ecc8]" />
                                Proyección de Crecimiento
                            </h3>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Histórico de rendimientos netos por semestre</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#13ecc8]" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficio Neto</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#13ecc8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#13ecc8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBeneficio" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', padding: '16px' }}
                                    itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="ingresos" stroke="#13ecc8" strokeWidth={4} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="beneficio" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBeneficio)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Affiliates Ranking */}
                <div className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden">
                    <div className="relative z-10 space-y-8 h-full">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                                <Crown size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Top Partners</h3>
                                <p className="text-slate-500 text-[10px] font-bold">Generadores de negocio premium</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {topAffiliates.length > 0 ? (
                                topAffiliates.map((aff, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#13ecc8]/20 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-[#13ecc8] text-sm border border-white/5">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white tracking-tight">{aff.profiles?.full_name || 'Partner'}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{aff.affiliate_code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-[#13ecc8]">{aff.total_earned.toFixed(0)}€</div>
                                            <div className="text-[9px] font-bold text-slate-600 uppercase">Acumulado</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5 animate-pulse opacity-50" />
                                ))
                            )}
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Ver ranking completo <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Recent Payments Table */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <CreditCard size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Monitor de Transacciones</h3>
                            <p className="text-slate-500 text-[10px] font-bold">Rastreo de suscripciones y márgenes en tiempo real</p>
                        </div>
                    </div>
                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">
                        Exportar a CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fecha</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente (Propietario)</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Plan</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Afiliado / Partner</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#13ecc8] text-right">Margen Neto (€)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentPayments.length > 0 ? (
                                recentPayments.map((payment, i) => (
                                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-bold text-slate-400">
                                                {new Date(payment.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center font-bold text-slate-500 text-[10px] border border-white/5 uppercase">
                                                    {(payment.referral_id?.referred_user_id?.profiles?.full_name || 'U').charAt(0)}
                                                </div>
                                                <div className="text-sm font-black text-white tracking-tight">
                                                    {payment.referral_id?.referred_user_id?.profiles?.full_name || 'Usuario Business'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                Plan Business
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center text-xs font-bold text-slate-400 italic">
                                            {payment.referral_id?.affiliate_id?.affiliate_code || '-'}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="text-base font-black text-[#13ecc8] group-hover:scale-110 transition-transform origin-right tracking-tighter">
                                                +{(149 - Number(payment.amount)).toFixed(2)}€
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-10 py-12 text-center text-slate-600 italic font-medium">Buscando transacciones recientes...</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
