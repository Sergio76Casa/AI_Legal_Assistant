import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, RefreshCw, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AffiliateRanking: React.FC = () => {
    // Top partners data could be fetched via RPC in the future
    const partners = [
        { rank: 1, name: 'Partner #12', amount: 1450.20, color: 'text-amber-400', glow: 'shadow-amber-500/10' },
        { rank: 2, name: 'Partner #42', amount: 1250.00, color: 'text-slate-300', glow: 'shadow-slate-500/10' },
        { rank: 3, name: 'Partner #09', amount: 980.50, color: 'text-amber-800', glow: 'shadow-amber-900/10' },
    ];

    return (
        <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 lg:p-10 flex flex-col h-full relative group overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-1000">
                <Trophy size={140} className="text-primary" />
            </div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                        <TrendingUp size={20} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Elite Performance</h4>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                    <RefreshCw size={10} className="animate-spin-slow" /> LIVE
                </div>
            </div>

            <div className="space-y-4 relative z-10 flex-1">
                {partners.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-lg font-black relative px-1",
                                p.color
                            )}>
                                {p.rank === 1 && <Star size={10} className="absolute -top-1 -right-1 fill-amber-400 text-amber-400" />}
                                #{p.rank}
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{p.name}</span>
                                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Verified Partner Alpha</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-white">{p.amount.toFixed(2)}€</div>
                            <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">30D Yield</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 text-center relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Actualizado hace 2 horas</p>
            </div>
        </div>
    );
};
