import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HealthLog } from '../../hooks/system/useHealthCheck';

interface SystemLogsProps {
    logs: HealthLog[];
}

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
    return (
        <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 flex flex-col h-full relative group overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Terminal size={140} className="text-primary" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Terminal size={18} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Event Log Terminal</h4>
                </div>
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                    LIVE_STREAMING
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar relative z-10 pr-2">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-black/20 border border-white/5 p-4 rounded-xl font-mono text-[10px] space-y-2 group/item hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-600 font-bold">[{log.timestamp.toLocaleTimeString()}]</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                                        log.status === 'operational' ? "bg-emerald-500/10 text-emerald-500" :
                                        log.status === 'degraded' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-red-500/10 text-red-500"
                                    )}>
                                        {log.status === 'operational' ? 'SUCCESS' : 'ALERT'}
                                    </span>
                                    <span className="text-slate-300 font-black tracking-tight">{log.service}</span>
                                </div>
                                <span className="text-slate-600 text-[8px] group-hover/item:text-primary transition-colors">{log.latency}ms</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium pl-4 border-l border-white/5 group-hover/item:border-primary/20 transition-all">
                                {log.message}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">SYSTEM READY - SCANNING FREQUENCY: 60s</p>
            </div>
        </div>
    );
};
