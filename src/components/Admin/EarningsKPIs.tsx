import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Activity, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EarningsKPIsProps {
    stats: {
        mrr: number;
        netProfit: number;
        affiliateCost: number;
        activeAffiliates: number;
    };
}

export const EarningsKPIs: React.FC<EarningsKPIsProps> = ({ stats }) => {
    const kpis = [
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
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden group hover:border-[#13ecc8]/30 transition-all shadow-2xl h-[280px]"
                >
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20", kpi.bg)}></div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between">
                            <div className={cn("p-4 rounded-2xl border border-white/5 bg-white/5", kpi.color.replace('text-', 'text-'))}>
                                <kpi.icon size={28} className={kpi.color} />
                            </div>
                            <ArrowUpRight size={24} className="text-slate-700 group-hover:text-[#13ecc8] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">{kpi.label}</h3>
                            <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4 group-hover:scale-[1.02] transition-transform origin-left">
                                {kpi.value}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                    <TrendingUp size={10} className="text-emerald-400" />
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight italic">
                                    {kpi.sub}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
