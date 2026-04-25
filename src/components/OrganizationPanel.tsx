import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserPlus, PenTool, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

// Hooks
import { useOrganizationMembers } from '../hooks/organization/useOrganizationMembers';
import { useOrganizationInvites } from '../hooks/organization/useOrganizationInvites';
import { useTenant } from '../lib/TenantContext';
import { PLAN_IDS, getPlanMetadata } from '../lib/constants/plans';

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
import { Building2 } from 'lucide-react';

interface OrganizationPanelProps {
    tenantId: string;
    subView?: 'members' | 'invite' | 'signatures';
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ tenantId, subView: initialSubView = 'members' }) => {
    const { t } = useTranslation();
    const { tenant, profile } = useTenant();
    const [subView, setSubView] = useState(initialSubView);

    // Modern Hooks Orchestration
    const { 
        users, loading, updatingPlan, 
        fetchUsers, handleUpdatePlan, logActivity 
    } = useOrganizationMembers(tenantId);


    // Modals Control
    const [selectedUserForPDF, setSelectedUserForPDF] = useState<any | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [signatureUser, setSignatureUser] = useState<any | null>(null);
    const [bundleSuccessData, setBundleSuccessData] = useState<any | null>(null);

    useEffect(() => {
        if (tenantId) fetchUsers();
    }, [tenantId, fetchUsers]);

    // Update internal subview if prop changes
    useEffect(() => {
        setSubView(initialSubView);
    }, [initialSubView]);

    const handleBundleSuccess = (data: any) => {
        setBundleSuccessData(data);
        logActivity('BUNDLE_GENERATED', `Generado pack "${data.bundleName}" para ${data.clientName}`, data);
    };

    const handleTierChange = async (userId: string, newTier: string) => {
        const res = await handleUpdatePlan(userId, newTier);
        if (!res.success) alert(res.error);
    };

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Building2} 
                title="Mi Organización" 
                subtitle={`${tenant?.name?.toUpperCase() || 'ESPACIO PERSONAL'} • PROTOCOLO DE CONTROL`}
                badge={profile?.subscription_tier?.toUpperCase() || "Free"}
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 space-y-10">
                {/* Context Navigation & Quota */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Quota Section (Always Visible to provide context) */}
                <div className="lg:col-span-12">
                     <QuotaMonitor 
                        totalUsers={users.length} 
                        usedCases={42} // Simulated for now, could be fetched from a global hook
                        planTier={profile?.subscription_tier?.toLowerCase() as any || 'free'}
                        maxUsers={getPlanMetadata(profile?.subscription_tier).maxDocuments === -1 ? 99 : 5} // Logic for max users can be refined
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
                        <div className="flex items-center justify-between px-2">
                             <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Shield className="text-primary" size={16} /> {t('org_panel.users_list')}
                             </h2>
                             <button 
                                onClick={() => setSubView('invite')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                             >
                                <UserPlus size={14} className="inline mr-2" />
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
                            <SignatureManager templateId="ALL" templateName="Todos los documentos" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Modals Orchestration */}
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
        </div>
    );
};
