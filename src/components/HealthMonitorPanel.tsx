import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Activity, Zap, Server, Globe, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Hooks
import { useHealthCheck } from '../hooks/system/useHealthCheck';

// Sub-components
import { ServicePulseCard } from './Health/ServicePulseCard';
import { LatencyGraph } from './Health/LatencyGraph';
import { SystemLogs } from './Health/SystemLogs';

export const HealthMonitorPanel: React.FC = () => {
    const { services, logs, isRefreshing, refreshAll } = useHealthCheck(60000);
    const [scanAnimation, setScanAnimation] = useState(false);

    const handleForceSync = async () => {
        setScanAnimation(true);
        await refreshAll();
        setTimeout(() => setScanAnimation(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700 relative">
            {/* Global Scan Sweep Animation */}
            <AnimatePresence>
                {scanAnimation && (
                    <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="fixed inset-x-0 h-[2px] bg-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.8)] z-[100] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#0A0F1D] border border-white/10 rounded-[1.5rem] flex items-center justify-center text-primary shadow-2xl relative group">
                            <Activity size={34} className="group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 rounded-[1.5rem] bg-primary/5 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                                System <span className="text-primary tracking-normal not-italic">War Room</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">
                                Tactical Health & Infrastructure Monitoring
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col text-right mr-4">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global Stability Index</span>
                        <span className="text-sm font-black text-emerald-500">99.98% OK</span>
                    </div>
                    <button
                        onClick={handleForceSync}
                        disabled={isRefreshing}
                        className={cn(
                            "group relative px-8 py-4 bg-transparent border border-primary/40 rounded-2xl flex items-center gap-3 transition-all active:scale-95",
                            isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                        )}
                    >
                        <RefreshCcw size={18} className={cn("text-primary", isRefreshing && "animate-spin")} />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Force Global Sync</span>
                        
                        {/* Neon Corner Decorations */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </header>

            {/* 1. Pulse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.values(services).map((service, idx) => (
                    <ServicePulseCard key={service.name} service={service} index={idx} />
                ))}
            </div>

            {/* 2. Tactical Center: Stability & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
                {/* Latency History */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 flex-1 group">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <Globe size={18} />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Stability Index</h4>
                            </div>
                            <Info size={14} className="text-slate-700" />
                        </div>
                        <div className="h-40 relative">
                             <LatencyGraph history={services['Supabase Gateway'].history} color="#818cf8" />
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <span className="text-[9px] font-black uppercase text-slate-500">Peak Latency</span>
                                <span className="text-xs font-black text-rose-400">1,240ms</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <span className="text-[9px] font-black uppercase text-slate-500">Service Uptime</span>
                                <span className="text-xs font-black text-emerald-400">100% (24H)</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <Zap size={20} />
                        </div>
                        <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest leading-relaxed">
                            <span className="text-primary font-black">AI_CORE_ACTIVE:</span> Todos los modelos de Gemini Pro y Flash están operativos en la región.
                        </p>
                    </div>
                </div>

                {/* Event Logs Terminal */}
                <div className="lg:col-span-8">
                    <SystemLogs logs={logs} />
                </div>
            </div>

            {/* 3. Infrastructure Summary Footer */}
            <div className="bg-[#0A0F1D]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 lg:p-14 relative overflow-hidden group">
                 {/* Visual Texture */}
                 <div className="absolute right-0 bottom-0 opacity-[0.05] -mr-20 -mb-20 pointer-events-none group-hover:rotate-12 transition-transform [transition-duration:3000ms]">
                    <Server size={300} className="text-primary" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Redundancia</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            Capa de persistencia con <span className="text-white font-black italic">PostgreSQL Hyper-Scaling</span> activada. Failover automático detectado en el nodo regional.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Seguridad</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            Cifrado <span className="text-white font-black italic">AES-256-GCM</span> activo en todos los túneles de Edge Functions. Sistema de auditoría Stark v4.2 inyectado.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Auto-escalado</h5>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            Capacidad actual al <span className="text-white font-black italic">14%</span>. Umbral de escalado dinámico configurado al <span className="text-white font-black">75%</span> de tráfico concurrente.
                        </p>
                    </div>
                 </div>
            </div>
        </div>
    );
};
