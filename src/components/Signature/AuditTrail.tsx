import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Database, Cpu, Activity } from 'lucide-react';

interface AuditTrailProps {
    status: string;
    requestID?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ status, requestID }) => {
    return (
        <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 lg:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
                <Shield size={160} className="text-primary" />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter">Monitoreo de Integridad</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Iron Silo™ Protocol</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Live Audit</span>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { label: 'Estado del Vínculo', value: status, icon: Cpu },
                    { label: 'ID Transacción', value: requestID?.substring(0, 16) || 'PENDIENTE', icon: Database, mono: true },
                    { label: 'Cifrado de Sesión', value: 'SHA-256 / AES-256', icon: Shield, mono: true },
                    { label: 'Certificación', value: 'Geolocalización Activa', icon: MapPin },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20 transition-all group/item"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={14} className="text-slate-600 group-hover/item:text-primary transition-colors" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold tracking-tight",
                            item.mono ? "font-mono text-primary/80" : "text-white",
                            status.includes('Error') && idx === 0 ? "text-red-400" : ""
                        )}>
                            {item.value}
                        </span>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] text-slate-600 font-medium leading-relaxed max-w-[240px] mx-auto italic">
                    "Esta sesión está siendo registrada bajo estándares de eIDAS para garantizar la validez legal del proceso."
                </p>
            </div>
        </div>
    );
};

// Local CN helper to avoid imports if not needed, but we have it in ../../lib/utils
import { cn } from '../../lib/utils';
