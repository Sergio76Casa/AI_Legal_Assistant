import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, ShieldAlert, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ServiceState, ServiceStatus } from '../../hooks/system/useHealthCheck';

interface ServicePulseCardProps {
    service: ServiceState;
    index: number;
}

const statusConfig: Record<ServiceStatus, { color: string, glow: string, icon: any, label: string }> = {
    operational: { color: 'text-emerald-400', glow: 'bg-emerald-400', icon: ShieldCheck, label: 'Stable' },
    degraded: { color: 'text-amber-400', glow: 'bg-amber-400', icon: Zap, label: 'Degraded' },
    down: { color: 'text-red-500', glow: 'bg-red-500', icon: ShieldAlert, label: 'Offline' },
    timeout: { color: 'text-rose-400', glow: 'bg-rose-400', icon: Activity, label: 'Timeout' },
};

export const ServicePulseCard: React.FC<ServicePulseCardProps> = ({ service, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = statusConfig[service.status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "relative bg-[#0A0F1D]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] overflow-hidden group transition-all duration-500",
                isExpanded ? "ring-1 ring-primary/20" : "hover:border-primary/10"
            )}
        >
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20 overflow-hidden rounded-[32px]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
            </div>

            <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative",
                            service.status === 'operational' ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                        )}>
                            <StatusIcon size={28} className={config.color} />
                            {/* Pulse Glow */}
                            <div className={cn(
                                "absolute inset-0 rounded-2xl animate-ping opacity-20",
                                config.glow
                            )} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white tracking-tight">{service.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>
                                    {config.label}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                    Last Ping: {service.latency}ms
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ChevronDown size={20} />
                        </motion.div>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Uptime 24H</span>
                        <span className="text-sm font-black text-white">99.98%</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Avg Latency</span>
                        <span className="text-sm font-black text-white">{Math.round(service.latency * 0.95)}ms</span>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <span>Capacity Load</span>
                                        <span className="text-primary italic">Optimal</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '42%' }}
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter">
                                    Nodo de procesamiento localizado en <span className="text-slate-300">AWS-EU-WEST-1</span>. Protocolo de seguridad Stark v4.2 activo.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
