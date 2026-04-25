import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Users, ArrowUpRight, DollarSign, Banknote } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsGridProps {
    stats: {
        clicks: number;
        conversions: number;
        convRate: number;
        pendingEarnings: number;
        totalPaid: number;
    };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    const items = [
        { label: 'Clics Totales', value: stats.clicks, icon: MousePointer2, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
        { label: 'Conversiones', value: stats.conversions, icon: Users, color: 'text-primary', glow: 'shadow-primary/10' },
        { label: 'Tasa de Conv.', value: `${stats.convRate}%`, icon: ArrowUpRight, color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
        { label: 'Pendiente', value: `${stats.pendingEarnings.toFixed(2)}€`, icon: DollarSign, color: 'text-amber-400', glow: 'shadow-amber-500/10' },
        { label: 'Total Cobrado', value: `${stats.totalPaid.toFixed(2)}€`, icon: Banknote, color: 'text-slate-300', glow: 'shadow-slate-400/10' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {items.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                        "bg-[#0A0F1D]/40 backdrop-blur-xl border border-white/5 p-7 rounded-3xl group hover:border-white/20 transition-all shadow-xl",
                        stat.glow
                    )}
                >
                    <div className="flex items-center justify-between mb-5">
                        <div className={cn("p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon size={18} />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(var(--primary),0.8)] transition-all" />
                    </div>
                    
                    <div className="space-y-1">
                        <div className="text-3xl font-black text-white tracking-tighter tabular-nums">
                            {stat.value}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                            {stat.label}
                        </div>
                    </div>
                    
                    {/* Hover Decoration */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
                </motion.div>
            ))}
        </div>
    );
};
