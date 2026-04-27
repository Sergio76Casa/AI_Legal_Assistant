import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Pencil, FileText, PenTool, Trash2, Loader2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { UserBundlesSection } from './UserBundlesSection';

interface MemberDirectoryProps {
    users: any[];
    loading: boolean;
    tenantId: string | undefined;
    updatingPlan: string | null;
    onUpdatePlan: (userId: string, tier: string) => void;
    onEditUser: (user: any) => void;
    onGeneratePDF: (user: any) => void;
    onSignatureRequest: (user: any) => void;
    onBundleSuccess: (data: any) => void;
    isTrashView?: boolean;
    onSoftDelete?: (userId: string) => void;
    onRestore?: (userId: string) => void;
    onPermanentDelete?: (userId: string) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
    users,
    loading,
    tenantId,
    updatingPlan,
    onUpdatePlan,
    onEditUser,
    onGeneratePDF,
    onSignatureRequest,
    onBundleSuccess,
    isTrashView = false,
    onSoftDelete,
    onRestore,
    onPermanentDelete
}) => {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 size={40} className="animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{t('org_panel.loading_users')}</span>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-40">
                <Shield size={40} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                    {isTrashView ? "La papelera está vacía" : "No hay miembros en esta organización"}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3 px-2">
                    <thead>
                        <tr className="text-slate-500">
                            <th className="px-6 py-2 font-black uppercase tracking-[0.2em] text-[9px]">{t('org_panel.headers.user')}</th>
                            <th className="px-6 py-2 font-black uppercase tracking-[0.2em] text-[9px]">{t('org_panel.headers.plan')}</th>
                            <th className="px-6 py-2 font-black uppercase tracking-[0.2em] text-[9px]">{t('org_panel.headers.access')}</th>
                            <th className="px-6 py-2 font-black uppercase tracking-[0.2em] text-[9px]">{t('org_panel.headers.status')}</th>
                            <th className="px-6 py-2 font-black uppercase tracking-[0.2em] text-[9px] text-right">{t('org_panel.headers.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='popLayout'>
                            {users.map((u, idx) => (
                                <motion.tr
                                    key={u.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                                    className={cn(
                                        "group bg-[#0A0F1D]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:bg-white/[0.04] hover:border-primary/20 transition-all",
                                        isTrashView && "grayscale-[0.5] opacity-80"
                                    )}
                                >
                                    <td className="px-6 py-6 rounded-l-2xl border-y border-l border-white/5 max-w-[250px]">
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black border border-primary/20 text-xl shadow-inner">
                                                    {u.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#050811]",
                                                    isTrashView ? "bg-red-500" : "bg-emerald-500"
                                                )} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-white text-base tracking-tight mb-1 group-hover:text-primary transition-colors cursor-default whitespace-normal break-all">
                                                    {u.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                                        u.role === 'admin' 
                                                            ? 'bg-primary/10 text-primary border-primary/20' 
                                                            : 'bg-white/5 text-slate-500 border-white/5'
                                                    )}>
                                                        {u.role === 'admin' ? <Shield size={10} /> : null}
                                                        {u.role === 'admin' ? t('org_panel.role_admin') : t('org_panel.role_user')}
                                                    </span>
                                                </div>
                                                {!isTrashView && <UserBundlesSection userId={u.id} tenantId={tenantId} onBundleSuccess={onBundleSuccess} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-y border-white/5">
                                        <div className="relative w-fit group/select">
                                            <select
                                                value={u.tier === 'free' ? 'free' : 'premium'}
                                                disabled={updatingPlan === u.id || isTrashView}
                                                onChange={(e) => onUpdatePlan(u.id, e.target.value)}
                                                className={cn(
                                                    "appearance-none cursor-pointer outline-none inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all pr-8 border disabled:opacity-50",
                                                    u.tier !== 'free'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:ring-2 hover:ring-amber-500/20'
                                                        : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
                                                )}
                                            >
                                                <option value="free" className="bg-slate-900 text-slate-400">Personal (0€)</option>
                                                <option value="premium" className="bg-slate-900 text-amber-500">Professional (9,99€)</option>
                                            </select>
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-current">
                                                {updatingPlan === u.id ? <Loader2 size={10} className="animate-spin" /> : <Clock size={10} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-y border-white/5">
                                        {u.joinedViaInvite ? (
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <Mail size={14} className="opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Invitación</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Shield size={14} className="opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Directo</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-y border-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shadow-[0_0_10px]",
                                                isTrashView ? "bg-red-500 shadow-red-500" : "bg-emerald-500 shadow-emerald-500"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                isTrashView ? "text-red-500/80" : "text-emerald-500/80"
                                            )}>{isTrashView ? "Eliminado" : "Activo"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-white/5 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-500">
                                            {!isTrashView ? (
                                                <>
                                                    <button
                                                        onClick={() => onEditUser(u)}
                                                        className="p-3 bg-white/5 hover:text-white hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-all"
                                                        title={t('org_panel.tooltips.edit_client')}
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onGeneratePDF(u)}
                                                        className="p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-2xl border border-primary/10 transition-all"
                                                        title={t('org_panel.tooltips.generate_doc')}
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onSignatureRequest(u)}
                                                        className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl border border-indigo-500/10 transition-all"
                                                        title="Solicitar Firma Digital"
                                                    >
                                                        <PenTool size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onSoftDelete?.(u.id)}
                                                        className="p-3 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                                                        title="Mover a la papelera"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onRestore?.(u.id)}
                                                        className="p-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/10 transition-all"
                                                        title="Restaurar cliente"
                                                    >
                                                        <RotateCcw size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onPermanentDelete?.(u.id)}
                                                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-2xl border border-red-500/10 hover:text-white transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
                                                        title="Borrar permanentemente"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="grid grid-cols-1 gap-4 xl:hidden px-2">
                <AnimatePresence mode='popLayout'>
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
        </div>
    );
};
