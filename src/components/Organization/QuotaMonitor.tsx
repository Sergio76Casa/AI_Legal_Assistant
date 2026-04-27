import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getPlanMetadata } from '../../lib/constants/plans';

interface QuotaMonitorProps {
    totalUsers: number;
    maxUsers?: number;
    totalCases?: number;
    usedCases?: number;
    planTier: 'free' | 'premium' | 'business' | 'enterprise';
}

export const QuotaMonitor: React.FC<QuotaMonitorProps> = ({
    totalUsers,
    maxUsers = 5,
    totalCases = 100,
    usedCases = 42,
    planTier = 'free'
}) => {
    const userPct = Math.min((totalUsers / maxUsers) * 100, 100);
    const casePct = Math.min((usedCases / totalCases) * 100, 100);

    const config = getPlanMetadata(planTier);

    const ProgressBar = ({ label, current, total, pct, icon: Icon, glowClass }: any) => (
        <div className="space-y-3 group/bar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-hover/bar:text-primary transition-colors">
                        <Icon size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-white">{current}</span>
                    <span className="text-[10px] font-bold text-slate-600">/ {total}</span>
                </div>
            </div>
            
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                <div
                    style={{ width: `${pct}%` }}
                    className={cn(
                        "h-full rounded-full relative",
                        planTier === 'free' ? "bg-slate-500" : "bg-primary"
                    )}
                >
                    {/* Contenido estático */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <BarChart3 size={120} className="text-primary" />
            </div>

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)] shrink-0">
                        <Zap size={20} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tighter truncate">Estado de Suscripción</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border transition-all", 
                                config.badgeClass)}>
                                PLAN {config.commercialName}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="relative group/tooltip">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 transition-all cursor-help">
                        <HelpCircle size={18} />
                    </div>
                    <div className="absolute top-full right-0 group-hover/tooltip:translate-y-0 transition-all duration-300 z-[100]">
                        <div className="mt-3 w-56 p-4 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none relative">
                            <p className="text-[10px] font-bold text-slate-200 leading-relaxed uppercase tracking-widest">
                                {userPct > 80 ? "Capacidad casi al límite. Actualiza para invitar más gestores." : "Tu plan actual permite hasta 5 gestores administrativos."}
                            </p>
                            <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2 text-primary">
                                <TrendingUp size={10} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Ver Planes Enterprise</span>
                            </div>
                            {/* Pincho de flecha (ahora arriba) */}
                            <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-900 border-l border-t border-white/20 rotate-45" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <ProgressBar 
                    label="Usuarios del Equipo" 
                    current={totalUsers} 
                    total={maxUsers} 
                    pct={userPct} 
                    icon={TrendingUp} 
                    glowClass={config.glow}
                />
                
                <ProgressBar 
                    label="Solicitudes de Firma" 
                    current={usedCases} 
                    total={totalCases} 
                    pct={casePct} 
                    icon={BarChart3} 
                    glowClass={config.glow}
                />
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">Next cycle: April 30, 2026</p>
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">Synced with Stripe™</span>
                </div>
            </div>
        </div>
    );
};
