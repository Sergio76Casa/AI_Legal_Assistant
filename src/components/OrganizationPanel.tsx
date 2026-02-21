import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Shield, Trash2, CheckCircle2, AlertCircle, FileText, Loader2, FolderDown, Pencil } from 'lucide-react';
import { TemplateSelectorModal } from './PDFMapper/TemplateSelectorModal';
import { EditProfileModal } from './EditProfileModal';
import { SuccessBundleModal } from './SuccessBundleModal';

import { useTranslation } from 'react-i18next';

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
            // result: { blob, fileName, fileCount, clientName, bundleName }

            // Descargar ZIP
            const url = window.URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName; // Use generated filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Trigger Success Modal & Logging
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
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ tenantId }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [selectedUserForPDF, setSelectedUserForPDF] = useState<any | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Success Modal State
    const [bundleSuccessData, setBundleSuccessData] = useState<any | null>(null);

    useEffect(() => {
        if (tenantId) fetchUsers();
    }, [tenantId]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles for this tenant
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: inviteEmail,
                    tenant_id: tenantId,
                    role: 'user' // Default to member role
                }
            });

            if (error) throw error;

            if (data.error) throw new Error(data.error);

            setStatus({ type: 'success', message: t('org_panel.invite_success', { token: data.invite_token }) });
            setInviteEmail('');
            // TODO: Refresh list if we show pending invites
        } catch (error: any) {
            console.error('Invite error:', error);
            setStatus({ type: 'error', message: error.message || t('org_panel.invite_error') });
        }
    };

    const handleBundleSuccess = async (data: any) => {
        setBundleSuccessData(data); // Show modal

        // Log Activity
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BuildingIcon size={24} className="text-primary" />
                    {t('org_panel.title')}
                </h2>
                <div className="text-sm text-slate-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {t('org_panel.id', { id: tenantId })}
                </div>
            </div>

            {/* Invite Form */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-sm border border-primary/20">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <UserPlus size={18} />
                    {t('org_panel.invite_title')}
                </h3>
                <form onSubmit={handleInvite} className="flex gap-4">
                    <input
                        type="email"
                        placeholder={t('org_panel.invite_placeholder')}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white/5 text-white placeholder-slate-500"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-primary text-slate-900 px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-bold flex items-center gap-2"
                    >
                        <Mail size={18} />
                        {t('org_panel.invite_btn')}
                    </button>
                </form>
                {status && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {status.message}
                    </div>
                )}
            </div>

            {/* Users List */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-white">{t('org_panel.users_list')} ({users.length})</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">{t('org_panel.loading_users')}</div>
                ) : (
                    <table className="w-full text-left text-base">
                        <thead className="bg-white/5 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">{t('org_panel.headers.user')}</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">{t('org_panel.headers.role')}</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">{t('org_panel.headers.join_date')}</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">{t('org_panel.headers.status')}</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">{t('org_panel.headers.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/20 text-lg">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">{user.email}</div>
                                                <div className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">{user.id}</div>

                                                {/* Sección de Packs */}
                                                <UserBundlesSection userId={user.id} tenantId={tenantId} onBundleSuccess={handleBundleSuccess} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                            : 'bg-white/10 text-slate-400 border border-white/10'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} className="mr-1" /> : null}
                                            {user.role === 'admin' ? t('org_panel.role_admin') : t('org_panel.role_user')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-medium border border-primary/20">
                                            {t('org_panel.status_active')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition-colors"
                                            title={t('org_panel.tooltips.edit_client')}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedUserForPDF(user)}
                                            className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors"
                                            title={t('org_panel.tooltips.generate_doc')}
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                        {t('org_panel.no_users')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

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
        </div>
    );
};

const BuildingIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M16 18h.01" />
    </svg>
);
