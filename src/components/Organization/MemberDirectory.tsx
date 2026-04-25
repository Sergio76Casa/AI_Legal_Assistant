import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Pencil, FileText, PenTool, Trash2, Loader2, Clock } from 'lucide-react';
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
    onBundleSuccess
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

    return (
        <div className="overflow-x-auto">
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
                                className="group bg-[#0A0F1D]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:bg-white/[0.04] hover:border-primary/20 transition-all"
                            >
                                <td className="px-6 py-6 rounded-l-2xl border-y border-l border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black border border-primary/20 text-xl shadow-inner">
                                                {u.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050811]" />
                                        </div>
                                        <div>
                                            <div className="font-black text-white text-base tracking-tight mb-1 group-hover:text-primary transition-colors cursor-default">
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
                                            <UserBundlesSection userId={u.id} tenantId={tenantId} onBundleSuccess={onBundleSuccess} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 border-y border-white/5">
                                    <div className="relative w-fit group/select">
                                        <select
                                            value={u.tier === 'free' ? 'free' : 'premium'}
                                            disabled={updatingPlan === u.id}
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
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Activo</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 rounded-r-2xl border-y border-r border-white/5 text-right">
                                    <div className="flex items-center justify-end gap-2 text-slate-500">
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
                                        <button className="p-3 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};
