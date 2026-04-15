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
                    className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all"
                >
                    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12", kpi.bg)}></div>
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
    );
};
