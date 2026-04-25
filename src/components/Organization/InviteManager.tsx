import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Clock, CheckCircle2, AlertCircle, Copy, MessageCircle, X, Loader2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useOrganizationInvites } from '../../hooks/organization/useOrganizationInvites';

interface InviteManagerProps {
    tenantId: string | undefined;
}

export const InviteManager: React.FC<InviteManagerProps> = ({ tenantId }) => {
    const { t } = useTranslation();
    const [inviteMode, setInviteMode] = useState<'form' | 'pending'>('form');
    const [email, setEmail] = useState('');
    
    const {
        pendingInvitations,
        loadingInvites,
        status,
        setStatus,
        fetchPendingInvitations,
        handleInvite,
        handleDeleteInvitation
    } = useOrganizationInvites(tenantId);

    useEffect(() => {
        if (tenantId) fetchPendingInvitations();
    }, [tenantId, fetchPendingInvitations]);

    const onInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await handleInvite(email);
        if (res?.success) setEmail('');
    };

    return (
        <div className="space-y-8">
            {/* Header Tabs */}
            <div className="flex gap-2 p-1.5 bg-[#0A0F1D]/60 backdrop-blur-xl rounded-2xl border border-white/5 w-fit">
                {[
                    { id: 'form', label: 'Invitar Miembro', icon: UserPlus },
                    { id: 'pending', label: 'Invitaciones Pendientes', icon: Clock, count: pendingInvitations.length }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setInviteMode(tab.id as any)}
                        className={cn(
                            "group flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            inviteMode === tab.id 
                                ? "bg-primary text-slate-900 shadow-xl shadow-primary/10" 
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <tab.icon size={14} className={cn(inviteMode === tab.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-400")} />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                "ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black border",
                                inviteMode === tab.id ? "bg-slate-900 text-white border-white/10" : "bg-red-500 text-white border-slate-900"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {inviteMode === 'form' ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-[#0A0F1D]/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Mail size={120} className="text-primary" />
                        </div>

                        <div className="mb-10">
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                <span className="text-primary">Stark</span> Invitation Protocol
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Añade nuevos gestores o colaboradores a tu cuenta segura</p>
                        </div>

                        <form onSubmit={onInviteSubmit} className="space-y-6 relative z-10">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder={t('org_panel.invite_placeholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-10 py-4 bg-primary text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
                                >
                                    <Send size={18} />
                                    {t('org_panel.invite_btn')}
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {status && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "mt-8 p-6 rounded-2xl border flex flex-col gap-6",
                                        status.type === 'success' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                        <span className="font-black uppercase tracking-widest text-xs">{status.message}</span>
                                        {status.type === 'success' && <X size={16} className="ml-auto cursor-pointer opacity-40 hover:opacity-100" onClick={() => setStatus(null)} />}
                                    </div>

                                    {status.type === 'success' && status.token && (
                                        <div className="space-y-4 pt-6 border-t border-emerald-500/10">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Enlace de Acceso Rápido</p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-emerald-300/80 overflow-hidden truncate">
                                                    {window.location.origin}/join?token={status.token}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${window.location.origin}/join?token=${status.token}`);
                                                            alert('Link copiado');
                                                        }}
                                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
                                                        title="Copiar Link"
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/join?token=${status.token}`;
                                                            const text = `Te invito a unirte a mi organización profesional en LegalFlow AI. Accede aquí: ${url}`;
                                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 rounded-xl text-emerald-400 transition-all"
                                                        title="Enviar por WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="pending"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-[#0A0F1D]/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/5 shadow-2xl"
                    >
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                <Clock className="text-primary" size={20} />
                                Verificación Pendiente
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Usuarios en proceso de integración al sistema</p>
                        </div>

                        {loadingInvites ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-slate-600">
                                <Loader2 className="animate-spin" size={32} />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Sincronizando Servidores...</span>
                            </div>
                        ) : pendingInvitations.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl group">
                                <Mail size={48} className="mx-auto mb-4 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">No hay registros pendientes de activación</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {pendingInvitations.map(inv => (
                                        <motion.div
                                            key={inv.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{inv.email}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                                        Expiración del Token: <span className="font-mono text-slate-400">{new Date(inv.expires_at).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteInvitation(inv.id)}
                                                className="p-3 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                                            >
                                                <X size={20} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
