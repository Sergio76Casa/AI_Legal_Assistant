import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Pencil, FileText, Trash2, Loader2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { UserBundlesSection } from './UserBundlesSection';

interface MemberCardGridProps {
    users: any[];
    tenantId: string | undefined;
    updatingPlan: string | null;
    isTrashView: boolean;
    onUpdatePlan: (userId: string, tier: string) => void;
    onEditUser: (user: any) => void;
    onGeneratePDF: (user: any) => void;
    onBundleSuccess: (data: any) => void;
    onSoftDelete?: (userId: string) => void;
    onRestore?: (userId: string) => void;
    onPermanentDelete?: (userId: string) => void;
}

export const MemberCardGrid: React.FC<MemberCardGridProps> = ({
    users,
    tenantId,
    updatingPlan,
    isTrashView,
    onUpdatePlan,
    onEditUser,
    onGeneratePDF,
    onBundleSuccess,
    onSoftDelete,
    onRestore,
    onPermanentDelete
}) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 gap-4 xl:hidden px-2">
            <AnimatePresence mode="popLayout">
                {users.map((u, idx) => (
                    <motion.div
                        key={u.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                        className={cn(
                            "p-6 bg-[#0A0F1D]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl flex flex-col gap-6",
                            isTrashView && "grayscale-[0.5] opacity-90 border-red-500/20"
                        )}
                    >
                        {/* Card Header: User Info */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black border border-primary/20 text-2xl shadow-inner">
                                        {u.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#080B14]",
                                        isTrashView ? "bg-red-500" : "bg-emerald-500"
                                    )} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-black text-white text-lg tracking-tight whitespace-normal break-all">
                                        {u.email}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                            u.role === 'admin'
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : 'bg-white/5 text-slate-500 border-white/5'
                                        )}>
                                            {u.role === 'admin' ? <Shield size={10} /> : null}
                                            {u.role === 'admin' ? t('org_panel.role_admin') : t('org_panel.role_user')}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border bg-white/5 text-slate-500 border-white/5">
                                            {u.joinedViaInvite ? 'Invitación' : 'Directo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                                isTrashView ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}>
                                {isTrashView ? "Borrado" : "Activo"}
                            </div>
                        </div>

                        {/* Plan Selection (Mobile) */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">{t('org_panel.headers.plan')}</div>
                            <div className="relative group/select w-full">
                                <select
                                    value={u.tier === 'free' ? 'free' : 'premium'}
                                    disabled={updatingPlan === u.id || isTrashView}
                                    onChange={(e) => onUpdatePlan(u.id, e.target.value)}
                                    className={cn(
                                        "w-full appearance-none cursor-pointer outline-none flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all pr-10 border disabled:opacity-50",
                                        u.tier !== 'free'
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            : 'bg-white/5 text-slate-400 border-white/10'
                                    )}
                                >
                                    <option value="free" className="bg-slate-900 text-slate-400">Personal (0€)</option>
                                    <option value="premium" className="bg-slate-900 text-amber-500">Professional (9,99€)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-current">
                                    {updatingPlan === u.id ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                </div>
                            </div>
                        </div>

                        {/* Activity/Bundles */}
                        {!isTrashView && (
                            <div className="px-1">
                                <UserBundlesSection userId={u.id} tenantId={tenantId} onBundleSuccess={onBundleSuccess} />
                            </div>
                        )}

                        {/* Actions Footer (Mobile) */}
                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
                            {!isTrashView ? (
                                <>
                                    <button
                                        onClick={() => onEditUser(u)}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 min-h-[48px]"
                                    >
                                        <Pencil size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Editar</span>
                                    </button>
                                    <button
                                        onClick={() => onGeneratePDF(u)}
                                        className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20"
                                    >
                                        <FileText size={20} />
                                    </button>
                                    <button
                                        onClick={() => onSoftDelete?.(u.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20"
                                        title="Enviar a Papelera"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full flex flex-col gap-3">
                                    <button
                                        onClick={() => onRestore?.(u.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all min-h-[48px]"
                                    >
                                        <RotateCcw size={16} />
                                        <span>Restaurar Cliente</span>
                                    </button>
                                    <button
                                        onClick={() => onPermanentDelete?.(u.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all min-h-[48px]"
                                    >
                                        <XCircle size={16} />
                                        <span>Eliminar Definitivamente</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
