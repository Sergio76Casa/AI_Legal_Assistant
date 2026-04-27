import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserPlus, PenTool, Sparkles, AlertCircle, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Hooks
import { useOrganizationMembers } from '../hooks/organization/useOrganizationMembers';
import { useTenant } from '../lib/TenantContext';
import { getPlanMetadata } from '../lib/constants/plans';

// Sub-components
import { MemberDirectory } from './Organization/MemberDirectory';
import { InviteManager } from './Organization/InviteManager';
import { QuotaMonitor } from './Organization/QuotaMonitor';

// Unified Modals
import { TemplateSelectorModal } from './PDFMapper/TemplateSelectorModal';
import { EditProfileModal } from './EditProfileModal';
import { SuccessBundleModal } from './SuccessBundleModal';
import { SignatureRequestModal } from './SignatureRequestModal';
import { SignatureManager } from './PDFMapper/SignatureManager';
import { ViewHeader } from './Admin/ViewHeader';

interface OrganizationPanelProps {
    tenantId: string;
    subView?: 'members' | 'invite' | 'signatures';
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ tenantId, subView: initialSubView = 'members' }) => {
    const { t } = useTranslation();
    const { tenant, profile, loading: tenantLoading } = useTenant();
    const [subView, setSubView] = useState(initialSubView);

    // Modern Hooks Orchestration
    const {
        users, loading, updatingPlan,
        fetchUsers, handleUpdatePlan, logActivity,
        softDelete, restoreClient, permanentDelete
    } = useOrganizationMembers(tenantId);

    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
    const [deletedCount, setDeletedCount] = useState(0);

    // Modals Control
    const [selectedUserForPDF, setSelectedUserForPDF] = useState<any | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [signatureUser, setSignatureUser] = useState<any | null>(null);
    const [bundleSuccessData, setBundleSuccessData] = useState<any | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ userId: string, permanent: boolean } | null>(null);

    // Fetch users based on current viewMode
    useEffect(() => {
        if (tenantId && !tenantLoading) {
            fetchUsers(viewMode === 'trash');
        }
    }, [tenantId, tenantLoading, viewMode, fetchUsers]);

    // Fetch deleted count separately for the badge
    useEffect(() => {
        const fetchDeletedCount = async () => {
            if (!tenantId) return;
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .not('deleted_at', 'is', null);
            setDeletedCount(count || 0);
        };
        fetchDeletedCount();
    }, [tenantId, users]); // Re-fetch count when users change (deletion/restoration)

    const handleBundleSuccess = (data: any) => {
        setBundleSuccessData(data);
        logActivity('BUNDLE_GENERATED', `Generado pack "${data.bundleName}" para ${data.clientName}`, data);
    };

    const handleTierChange = async (userId: string, newTier: string) => {
        const res = await handleUpdatePlan(userId, newTier);
        if (!res.success) alert(res.error);
    };

    const onConfirmDeleteAction = async () => {
        if (!confirmDelete) return;
        
        let res;
        if (confirmDelete.permanent) {
            res = await permanentDelete(confirmDelete.userId);
            if (res.success) logActivity('PERMANENT_DELETE', `Usuario ${confirmDelete.userId} eliminado permanentemente`, { userId: confirmDelete.userId });
        } else {
            res = await softDelete(confirmDelete.userId);
            if (res.success) logActivity('SOFT_DELETE', `Usuario ${confirmDelete.userId} enviado a la papelera`, { userId: confirmDelete.userId });
        }

        if (!res.success) alert(res.error);
        setConfirmDelete(null);
    };

    return (
        <div className="page-enter space-y-12 min-w-0 flex-1">
            <ViewHeader 
                icon={Building2} 
                title={t('org_panel.title') || "Mi Organización"} 
                subtitle={`${tenant?.name?.toUpperCase() || 'ESPACIO PERSONAL'} • PROTOCOLO DE CONTROL`}
                badge={profile?.subscription_tier?.toUpperCase() || "Free"}
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-2 md:px-4 pb-20 space-y-10">
                {/* Context Navigation & Quota */}
                <div className="grid grid-cols-1 gap-8 items-start">
                    <div className="w-full">
                         <QuotaMonitor 
                            totalUsers={users.length} 
                            usedCases={42} 
                            planTier={profile?.subscription_tier?.toLowerCase() as any || 'free'}
                            maxUsers={getPlanMetadata(profile?.subscription_tier).maxDocuments === -1 ? 99 : 5}
                         />
                    </div>
                </div>

                {/* SubView Orchestrator */}
                <AnimatePresence mode="wait">
                    {subView === 'members' && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                     <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                                        <button
                                            onClick={() => setViewMode('active')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                                viewMode === 'active' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Sparkles size={14} />
                                            {t('org_panel.members_tab')}
                                        </button>
                                        <button
                                            onClick={() => setViewMode('trash')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                                viewMode === 'trash' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Shield size={14} />
                                            {t('org_panel.trash_tab')} ({deletedCount})
                                        </button>
                                     </div>

                                 <button 
                                    onClick={() => setSubView('invite')}
                                    className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                 >
                                    <UserPlus size={16} />
                                    {t('org_panel.invite_title')}
                                 </button>
                            </div>
                            
                            <MemberDirectory 
                                users={users}
                                loading={loading}
                                tenantId={tenantId}
                                updatingPlan={updatingPlan}
                                onUpdatePlan={handleTierChange}
                                onEditUser={setEditingUser}
                                onGeneratePDF={setSelectedUserForPDF}
                                onSignatureRequest={setSignatureUser}
                                onBundleSuccess={handleBundleSuccess}
                                isTrashView={viewMode === 'trash'}
                                onSoftDelete={(id) => setConfirmDelete({ userId: id, permanent: false })}
                                onRestore={async (id) => {
                                    const res = await restoreClient(id);
                                    if (res.success) logActivity('RESTORE_CLIENT', `Usuario ${id} restaurado`, { userId: id });
                                }}
                                onPermanentDelete={(id) => setConfirmDelete({ userId: id, permanent: true })}
                            />
                        </motion.div>
                    )}

                    {subView === 'invite' && (
                        <motion.div
                            key="invite"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <InviteManager tenantId={tenantId} />
                        </motion.div>
                    )}

                    {subView === 'signatures' && (
                        <motion.div
                            key="signatures"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <div className="bg-[#0A0F1D]/40 backdrop-blur-2xl p-10 rounded-[40px] border border-white/5 relative group">
                                <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                        <PenTool size={26} />
                                    </div>
                                    Firmas Digitales <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Monitor Central</span>
                                </h2>
                                <SignatureManager templateId="ALL" templateName="Todos los documentos" tenantId={tenantId} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Modals */}
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

            {/* Delete Confirmation Overlay */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                            "max-w-md w-full p-8 rounded-[32px] border shadow-2xl space-y-6",
                            confirmDelete.permanent 
                                ? "bg-red-950/40 border-red-500/30" 
                                : "bg-[#0A0F1D] border-white/10"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-4 rounded-2xl",
                                confirmDelete.permanent ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                            )}>
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    {confirmDelete.permanent 
                                        ? t('org_panel.delete_modal.title_perm') 
                                        : t('org_panel.delete_modal.title_soft')}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {confirmDelete.permanent 
                                        ? t('org_panel.delete_modal.desc_perm') 
                                        : t('org_panel.delete_modal.desc_soft')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button 
                                onClick={() => setConfirmDelete(null)}
                                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {t('org_panel.delete_modal.cancel')}
                            </button>
                            <button 
                                onClick={onConfirmDeleteAction}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    confirmDelete.permanent 
                                        ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20" 
                                        : "bg-white text-black hover:bg-slate-200"
                                )}
                            >
                                {confirmDelete.permanent 
                                    ? t('org_panel.delete_modal.confirm_perm') 
                                    : t('org_panel.delete_modal.confirm_soft')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
