import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CreditCard, ChevronRight, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getPlanMetadata } from '../../lib/constants/plans';
import { useAppSettings } from '../../lib/AppSettingsContext';

interface ReferralRecord {
    id: string;
    date: string;
    status: string;
    plan: string;
    commission: number;
}

interface ReferralHistoryProps {
    referrals: ReferralRecord[];
}

export const ReferralHistory: React.FC<ReferralHistoryProps> = ({ referrals }) => {
    const { settings } = useAppSettings();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0F1D]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] overflow-hidden"
        >
            <div className="p-8 lg:p-10 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                        <Calendar size={18} className="text-slate-500" /> Historial de Referencia
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest italic">Mostrando últimos movimientos Stark</p>
                </div>
                <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all">
                    <Filter size={18} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fecha de Alta</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado de Cuenta</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Plan Asignado</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Comisión Acumulada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {referrals.length === 0 ? (
                                <tr className="group">
                                    <td colSpan={4} className="px-10 py-20 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No se detectan trayectorias de referenciación activas</p>
                                    </td>
                                </tr>
                            ) : (
                                referrals.map((item, i) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-white/[0.03] transition-colors group cursor-default"
                                    >
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-slate-800 border border-white/5 group-hover:bg-primary transition-colors" />
                                                <span className="text-sm font-bold text-slate-300 tabular-nums">{item.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <span className={cn(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                                                item.status === 'Activo'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-tighter">
                                                <div className="p-1 px-2 bg-white/5 rounded-md border border-white/5 text-[10px]">
                                                    {getPlanMetadata(item.plan as any, settings?.plan_names).commercialName.split(' ')[0]}
                                                </div>
                                                {getPlanMetadata(item.plan as any, settings?.plan_names).commercialName}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="text-lg font-black text-primary group-hover:scale-110 transition-transform origin-right">
                                                    +{item.commission.toFixed(2)}€
                                                </div>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">Comisión Vitalicia</div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {referrals.length > 0 && (
                <div className="p-8 bg-black/20 border-t border-white/5 flex justify-center">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all group">
                        Cargar Historial Completo
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};
