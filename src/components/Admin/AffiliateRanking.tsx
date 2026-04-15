import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';

interface AffiliateRankingProps {
    topAffiliates: any[];
}

export const AffiliateRanking: React.FC<AffiliateRankingProps> = ({ topAffiliates }) => {
    return (
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
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5 animate-pulse opacity-50" />
                        ))
                    )}
                </div>

                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    Ver ranking completo <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};
