import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Shield, Trash2, CheckCircle2, AlertCircle, FileText, Loader2, FolderDown, Pencil, PenTool, Copy, MessageCircle, Clock, X } from 'lucide-react';
import { TemplateSelectorModal } from './PDFMapper/TemplateSelectorModal';
import { EditProfileModal } from './EditProfileModal';
import { SuccessBundleModal } from './SuccessBundleModal';
import { SignatureRequestModal } from './SignatureRequestModal';
import { SignatureManager } from './PDFMapper/SignatureManager';

import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

// Subcomponente para gestionar los Packs de cada usuario
const UserBundlesSection = ({ userId, tenantId, onBundleSuccess }: { userId: string, tenantId: string, onBundleSuccess: (data: any) => void }) => {
    const { t } = useTranslation();
    const [bundles, setBundles] = useState<any[]>([]);
    const [generatingBundleId, setGeneratingBundleId] = useState<string | null>(null);
    const [progressMsg, setProgressMsg] = useState('');

    useEffect(() => {
        if (tenantId) fetchBundles();
    }, [tenantId]);

    const fetchBundles = async () => {
        const { data } = await supabase
            .from('pdf_bundles')
            .select('*')
            .eq('tenant_id', tenantId);
        setBundles(data || []);
    };

    const handleGenerateBundle = async (bundle: any) => {
        setGeneratingBundleId(bundle.id);
        setProgressMsg(t('org_panel.generating'));

        try {
            // Importación dinámica para evitar cargar JSZip si no se usa
            const { generateBundleZIP } = await import('../lib/bundle-generator');

            const result = await generateBundleZIP(bundle.id, userId, (msg) => setProgressMsg(msg));

            // Descargar ZIP
            const url = window.URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onBundleSuccess(result);

        } catch (error) {
            console.error('Error generando pack:', error);
            alert(t('org_panel.generate_error'));
        } finally {
            setGeneratingBundleId(null);
            setProgressMsg('');
        }
    };

    if (bundles.length === 0) return null;

    return (
        <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-500 mb-2">{t('org_panel.quick_bundles')}</p>
            <div className="flex flex-wrap gap-2">
                {bundles.map(bundle => (
                    <button
                        key={bundle.id}
                        onClick={() => handleGenerateBundle(bundle)}
                        disabled={!!generatingBundleId}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/20"
                    >
                        {generatingBundleId === bundle.id ? (
                            <>
                                <Loader2 size={12} className="animate-spin" />
                                {progressMsg || t('org_panel.generating')}
                            </>
                        ) : (
                            <>
                                <FolderDown size={12} />
                                {bundle.name}
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface OrganizationPanelProps {
    tenantId: string;
    subView?: 'members' | 'invite' | 'signatures';
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ tenantId, subView = 'members' }) => {
    const { t } = useTranslation();

    // Core States
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, token?: string } | null>(null);

    // Modals States
    const [selectedUserForPDF, setSelectedUserForPDF] = useState<any | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [signatureUser, setSignatureUser] = useState<any | null>(null);
    const [bundleSuccessData, setBundleSuccessData] = useState<any | null>(null);

    // Invitations States
    const [inviteMode, setInviteMode] = useState<'form' | 'pending'>('form');
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

    useEffect(() => {
        if (tenantId) {
            fetchUsers();
            fetchPendingInvitations();
        }
    }, [tenantId]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Users in Tenant
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;

            const userIds = (profiles || []).map(u => u.id);

            // 2. Fetch all accepted invitations for this tenant to cross-reference
            const { data: acceptedInvites } = await supabase
                .from('tenant_invitations')
                .select('email')
                .eq('tenant_id', tenantId)
                .eq('status', 'accepted');

            const acceptedEmailsSet = new Set((acceptedInvites || []).map(inv => inv.email));

            // 3. Fetch Subscriptions for these users
            const { data: subsData } = await supabase
                .from('subscriptions')
                .select('user_id, tier')
                .in('user_id', userIds);

            const subsMap = new Map((subsData || []).map(s => [s.user_id, s.tier]));

            // 4. Mark each user
            const usersWithMeta = (profiles || []).map(u => {
                const internalTier = subsMap.get(u.id) || u.subscription_tier || 'free';
                // Map 'pro' or 'business' to 'premium' for the UI consistency
                const mappedTier = (internalTier === 'pro' || internalTier === 'business') ? 'premium' : internalTier;

                return {
                    ...u,
                    joinedViaInvite: acceptedEmailsSet.has(u.email),
                    tier: mappedTier
                };
            });

            setUsers(usersWithMeta);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingInvitations = async () => {
        setLoadingInvites(true);
        try {
            const { data, error } = await supabase
                .from('tenant_invitations')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('status', 'pending');

            if (error) throw error;
            setPendingInvitations(data || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        } finally {
            setLoadingInvites(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: inviteEmail,
                    tenant_id: tenantId,
                    role: 'user'
                }
            });

            if (error) throw error;

            if (data.error) {
                if (data.error === 'ERROR_FORBIDDEN') throw new Error('No tienes permisos suficientes para invitar miembros.');
                if (data.error === 'ERROR_ALREADY_MEMBER') throw new Error('Este usuario ya es miembro de la organización.');
                throw new Error(data.error);
            }

            setStatus({
                type: 'success',
                message: t('org_panel.invite_success_msg', { defaultValue: 'Invitación creada correctamente' }),
                token: data.invite_token
            });
            setInviteEmail('');
            fetchPendingInvitations();
        } catch (error: any) {
            console.error('Invite error:', error);
            let errMsg = error.message || t('org_panel.invite_error');
            setStatus({ type: 'error', message: errMsg });
        }
    };

    const handleDeleteInvitation = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta invitación?')) return;
        try {
            const { error } = await supabase
                .from('tenant_invitations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPendingInvitations(prev => prev.filter(inv => inv.id !== id));
        } catch (error) {
            console.error('Error deleting invitation:', error);
            alert('Error al eliminar la invitación');
        }
    };

    const handleUpdatePlan = async (userId: string, newTier: string) => {
        setUpdatingPlan(userId);
        try {
            // Usamos una función RPC de base de datos para saltar las restricciones de RLS
            // que impiden que un admin modifique directamente las tablas de otros usuarios
            const { data, error } = await supabase.rpc('update_member_tier', {
                p_member_id: userId,
                p_new_tier: newTier
            });

            if (error) throw error;

            if (data && data.success === false) {
                throw new Error(data.error);
            }

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        } catch (error: any) {
            console.error('Error updating plan:', error);
            alert(error.message || 'No tienes permisos suficientes o hubo un error al actualizar el plan.');
        } finally {
            setUpdatingPlan(null);
        }
    };

    const handleBundleSuccess = async (data: any) => {
        setBundleSuccessData(data);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('activity_logs').insert({
                    tenant_id: tenantId,
                    user_id: user.id,
                    action_type: 'BUNDLE_GENERATED',
                    details: `Generado pack "${data.bundleName}" para ${data.clientName}`,
                    metadata: data
                });
            }
        } catch (err) {
            console.error('Error logging activity:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {subView === 'invite' && (
                <div className="space-y-6">
                    {/* Interior Tabs for Invite subView */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                        <button
                            onClick={() => setInviteMode('form')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                inviteMode === 'form' ? "bg-primary text-slate-900 shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <UserPlus size={14} />
                            Invitar Miembro
                        </button>
                        <button
                            onClick={() => setInviteMode('pending')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative",
                                inviteMode === 'pending' ? "bg-primary text-slate-900 shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Clock size={14} />
                            Invitaciones Pendientes
                            {pendingInvitations.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white border border-slate-900">
                                    {pendingInvitations.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {inviteMode === 'form' ? (
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-primary/20 animate-in fade-in slide-in-from-left-4">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <UserPlus size={24} className="text-primary" />
                                    </div>
                                    {t('org_panel.invite_title')}
                                </h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 ml-12">Añade nuevos gestores o colaboradores a tu cuenta</p>
                            </div>

                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="email"
                                        placeholder={t('org_panel.invite_placeholder')}
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white/5 text-white placeholder-slate-600 font-medium"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="bg-primary text-slate-900 px-8 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Mail size={18} />
                                        {t('org_panel.invite_btn')}
                                    </button>
                                </div>
                            </form>
                            {status && (
                                <div className={`mt-6 p-4 rounded-xl flex flex-col gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    <div className="flex items-center gap-2">
                                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <span className="font-bold">{status.message}</span>
                                    </div>

                                    {status.type === 'success' && status.token && (
                                        <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-emerald-500/20">
                                            <p className="text-[10px] uppercase font-black opacity-60 tracking-widest">Enlace de acceso rápido para el cliente:</p>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="flex-1 flex items-center gap-2 bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400/90 overflow-hidden truncate">
                                                    {window.location.origin}/join?token={status.token}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/join?token=${status.token}`;
                                                            navigator.clipboard.writeText(url);
                                                            alert('¡Enlace copiado!');
                                                        }}
                                                        className="flex-1 sm:flex-none p-3 bg-emerald-500 text-slate-900 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                                                    >
                                                        <Copy size={16} />
                                                        Copiar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/join?token=${status.token}`;
                                                            const text = `Te invito a unirte a mi organización profesional en LegalFlow. Accede aquí: ${url}`;
                                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="flex-1 sm:flex-none p-3 bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all"
                                                    >
                                                        <MessageCircle size={16} />
                                                        WhatsApp
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-primary/20 animate-in fade-in slide-in-from-right-4">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Clock size={24} className="text-primary" />
                                    </div>
                                    Invitaciones Pendientes
                                </h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 ml-12">Usuarios que aún no han aceptado su acceso</p>
                            </div>

                            {loadingInvites ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                                    <Loader2 size={32} className="animate-spin text-primary/40" />
                                    <span className="font-bold uppercase text-[10px] tracking-widest text-primary/60">Cargando invitaciones...</span>
                                </div>
                            ) : pendingInvitations.length === 0 ? (
                                <div className="p-12 text-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                                    <Mail size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-bold uppercase text-xs tracking-widest">No hay invitaciones pendientes</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingInvitations.map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-0.5">{inv.email}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                                        Expira: {new Date(inv.expires_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteInvitation(inv.id)}
                                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Cancelar Invitación"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {subView === 'members' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Shield size={24} className="text-primary" />
                                </div>
                                {t('org_panel.users_list')}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 ml-12">Gestiona el equipo y revisa la actividad de tus miembros</p>
                        </div>
                        <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                            <span className="text-lg font-black text-primary">{users.length}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">Usuarios</span>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-primary/40" />
                                <span className="font-bold uppercase text-[10px] tracking-widest">{t('org_panel.loading_users')}</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[10px]">{t('org_panel.headers.user')}</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[10px]">{t('org_panel.headers.plan')}</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[10px]">{t('org_panel.headers.access')}</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[10px]">{t('org_panel.headers.status')}</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-[0.2em] text-[10px] text-right">{t('org_panel.headers.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-6 font-medium">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 text-lg shadow-inner">
                                                            {u.email?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-base group-hover:text-primary transition-colors">{u.email}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'admin'
                                                                    ? 'bg-primary/15 text-primary border border-primary/20'
                                                                    : 'bg-white/5 text-slate-500 border border-white/10'
                                                                    }`}>
                                                                    {u.role === 'admin' ? <Shield size={8} /> : null}
                                                                    {u.role === 'admin' ? t('org_panel.role_admin') : t('org_panel.role_user')}
                                                                </span>
                                                            </div>
                                                            <UserBundlesSection userId={u.id} tenantId={tenantId} onBundleSuccess={handleBundleSuccess} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative group/select">
                                                        <select
                                                            value={u.tier === 'free' ? 'free' : 'premium'}
                                                            disabled={updatingPlan === u.id}
                                                            onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                                                            className={cn(
                                                                "appearance-none cursor-pointer outline-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all pr-6 border disabled:opacity-50",
                                                                u.tier !== 'free'
                                                                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/20 hover:bg-amber-500/25'
                                                                    : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
                                                            )}
                                                        >
                                                            <option value="free" className="bg-slate-900 text-slate-400">Básico (0€)</option>
                                                            <option value="premium" className="bg-slate-900 text-amber-500 font-black">Premium (9,99€/mes)</option>
                                                        </select>
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50">
                                                            {updatingPlan === u.id ? (
                                                                <Loader2 size={10} className="animate-spin" />
                                                            ) : (
                                                                <Clock size={8} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.joinedViaInvite ? (
                                                        <div className="flex items-center gap-1.5 text-indigo-400">
                                                            <Mail size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Invitación</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-slate-500">
                                                            <Shield size={12} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Directo</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Activo</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(u)}
                                                            className="p-2.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                                                            title={t('org_panel.tooltips.edit_client')}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedUserForPDF(u)}
                                                            className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all border border-primary/10"
                                                            title={t('org_panel.tooltips.generate_doc')}
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setSignatureUser(u)}
                                                            className="p-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all border border-indigo-500/10"
                                                            title="Solicitar Firma Digital"
                                                        >
                                                            <PenTool size={16} />
                                                        </button>
                                                        <button className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {subView === 'signatures' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <PenTool size={24} className="text-primary" />
                            </div>
                            Firmas Digitales
                        </h2>
                        <SignatureManager templateId="ALL" templateName="Todos los documentos" />
                    </div>
                </div>
            )}

            {/* Modales */}
            <SuccessBundleModal
                isOpen={!!bundleSuccessData}
                data={bundleSuccessData}
                onClose={() => setBundleSuccessData(null)}
            />

            {selectedUserForPDF && (
                <TemplateSelectorModal
                    isOpen={!!selectedUserForPDF}
                    onClose={() => setSelectedUserForPDF(null)}
                    clientProfile={selectedUserForPDF}
                    tenantId={tenantId}
                />
            )}

            {editingUser && (
                <EditProfileModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    userId={editingUser.id}
                    onProfileUpdated={fetchUsers}
                />
            )}

            {signatureUser && (
                <SignatureRequestModal
                    isOpen={!!signatureUser}
                    onClose={() => setSignatureUser(null)}
                    clientProfile={signatureUser}
                    tenantId={tenantId}
                />
            )}
        </div>
    );
};
