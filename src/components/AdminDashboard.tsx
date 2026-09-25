import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Globe, Building, Users, TrendingUp, Settings2, Shield, FileText, LayoutGrid, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

// Shared Components
import { OrganizationPanel } from './OrganizationPanel';
import { AdminEarnings } from './Admin/AdminEarnings';
import { ConfigPanel } from './ConfigPanel';
import { Sidebar } from './Sidebar';
import { useAppSettings } from '../lib/AppSettingsContext';
import { getPlanMetadata } from '../lib/constants/plans';
import { UserDocuments } from './UserDocuments';
import { TemplateManager } from './TemplateManager';
import { AffiliatePanel } from './AffiliatePanel';

// Admin Sub-components
import { GlobalContentTab } from './Admin/GlobalContentTab';
import { TenantManagementTab } from './Admin/TenantManagementTab';
import { ViewContentModal } from './Admin/ViewContentModal';
import { TeamManagementModal } from './Admin/TeamManagementModal';
import { ComplianceTab } from './Admin/ComplianceTab';

// Hooks
import { useGlobalContent } from '../hooks/useGlobalContent';
import { useTenantControl } from '../hooks/useTenantControl';
import { useTenant } from '../lib/TenantContext';
import { isSuperAdminEmail } from '../lib/constants/auth';

import { AdminNavTabs, NavItem } from './Admin/AdminNavTabs';

export const AdminDashboard: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
    const { settings } = useAppSettings();
    const [activeTab, setActiveTab] = useState<string>(
        initialTab === 'admin' ? 'earnings' : (initialTab || 'earnings')
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sync state with prop changes (browser navigation)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab === 'admin' ? 'earnings' : initialTab);
        }
    }, [initialTab]);
    const [viewingDoc, setViewingDoc] = useState<{ name: string, content: string } | null>(null);
    const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Hooks for business logic
    const {
        globalDocuments, isUploading, uploadProgress,
        fetchGlobalDocuments, handleUpload, handleDeleteDoc, handleReprocess, toggleLaw
    } = useGlobalContent();

    const { 
        tenants, tenantUsers, selectedTenant, setSelectedTenant, 
        isLoadingUsers, updatingPlan, updatingUserPlan,
        fetchTenants, fetchTenantUsers, handleUpdatePlan, handleUpdateUserPlan 
    } = useTenantControl();

    const { profile: userProfile, tenant, user, refreshTenant } = useTenant();

    const planMetadata = getPlanMetadata(userProfile?.subscription_tier || tenant?.plan || 'free', settings?.plan_names);

    const isSuperAdmin = userProfile?.role === 'superadmin' || isSuperAdminEmail(user?.email);

    const navItems: NavItem[] = [
        { id: 'earnings', icon: TrendingUp, label: 'MI DASHBOARD', category: 'Espacio de Trabajo' },
        { id: 'documents', icon: FileText, label: 'MIS DOCUMENTOS', category: 'Espacio de Trabajo' },
        { id: 'templates', icon: LayoutGrid, label: 'PLANTILLAS', category: 'Espacio de Trabajo' },
        { id: 'content', icon: Globe, label: 'LEYES GLOBALES', adminOnly: true, category: 'Legal AI' },
        { id: 'compliance', icon: Shield, label: 'COMPLIANCE GLOBAL', category: 'Legal AI' },
        { id: 'organization', icon: Users, label: 'MI ORGANIZACIÓN', category: 'Gestión' },
        { id: 'tenants', icon: Building, label: 'ORGANIZACIONES', adminOnly: true, category: 'Gestión' },
        { id: 'affiliates', icon: TrendingUp, label: 'PROGRAMA DE AFILIADOS', adminOnly: true, category: 'Gestión' },
        { id: 'settings', icon: Settings2, label: 'CONFIGURACIÓN', category: 'Sistema' }
    ].filter(item => !item.adminOnly || isSuperAdmin);

    // Sync all admin data
    const handleSync = useCallback(async (e?: React.MouseEvent | boolean) => {
        setIsSyncing(true);
        try {
            await Promise.all([
                fetchGlobalDocuments(),
                fetchTenants(),
                refreshTenant()
            ]);
            
            setRefreshKey(prev => prev + 1);
            
            if (e) {
                setSyncStatus({ type: 'success', message: 'Datos sincronizados correctamente' });
                setTimeout(() => setSyncStatus(null), 3000);
            }
        } catch (err: any) {
            setSyncStatus({ type: 'error', message: 'Error durante la sincronización' });
        } finally {
            setIsSyncing(false);
        }
    }, [fetchGlobalDocuments, fetchTenants, refreshTenant]);

    useEffect(() => {
        handleSync(false);
    }, [handleSync]);

    const handleViewContent = async (doc: any) => {
        try {
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('content')
                .eq('metadata->>source', doc.url)
                .order('id', { ascending: true });

            if (error) throw error;
            const fullContent = data?.map(d => d.content).join('\n\n---\n\n') || 'No hay contenido disponible todavía.';
            setViewingDoc({ name: doc.name, content: fullContent });
        } catch (error: any) {
            console.error('Error viewing doc:', error.message);
        }
    };

    return (
        <div className={cn(
            "min-h-screen bg-[#0a0f1d] flex",
            settings?.navigation_style === 'sidebar' ? "flex-row" : "flex-col pb-24 pt-24"
        )}>
            {settings?.navigation_style === 'sidebar' && (
                <>
                    {/* Mobile Backdrop */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                            />
                        )}
                    </AnimatePresence>

                    <Sidebar 
                        navItems={navItems}
                        activeTab={activeTab}
                        onTabChange={(id) => {
                            setActiveTab(id as any);
                            setIsMobileMenuOpen(false);
                        }}
                        user={user}
                        profile={userProfile}
                        tenant={tenant}
                        planMetadata={planMetadata}
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </>
            )}
            
            <div className={cn(
                "flex-1 w-full min-w-0 flex flex-col",
                settings?.navigation_style === 'sidebar' ? "p-0 md:p-6 md:px-10 lg:px-16 md:pt-20" : "mx-auto max-w-[1400px] px-6"
            )}>
                {/* Mobile Header (Sidebar Style) */}
                {settings?.navigation_style === 'sidebar' && (
                    <header className="md:hidden sticky top-0 z-[80] bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Shield size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-white">
                                Superadmin Panel
                            </span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </header>
                )}

                <div className={cn(
                    "flex-1 w-full min-w-0",
                    settings?.navigation_style === 'sidebar' ? "p-6 md:p-0" : ""
                )}>
                <AdminNavTabs
                    navItems={navItems}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id)}
                    isSidebarStyle={settings?.navigation_style === 'sidebar'}
                    isSyncing={isSyncing}
                    syncStatus={syncStatus}
                    onSync={() => handleSync(true)}
                />  </div>

                {/* 3. Contenido Dinámico */}
                <div key={refreshKey} className="space-y-10">
                    {activeTab === 'earnings' && <AdminEarnings />}
                    {activeTab === 'documents' && <UserDocuments userId={user?.id ?? ''} />}
                    {activeTab === 'templates' && <TemplateManager />}
                    
                    {activeTab === 'content' && (
                        <GlobalContentTab 
                            documents={globalDocuments}
                            isUploading={isUploading}
                            uploadProgress={uploadProgress}
                            onUpload={handleUpload}
                            onView={handleViewContent}
                            onDelete={handleDeleteDoc}
                            onToggleLaw={toggleLaw}
                            onReprocess={handleReprocess}
                            isAdmin={userProfile?.role === 'superadmin'}
                        />
                    )}

                    {activeTab === 'tenants' && (
                        <TenantManagementTab 
                            tenants={tenants}
                            updatingPlan={updatingPlan}
                            planNames={settings?.plan_names}
                            onUpdatePlan={handleUpdatePlan}
                            onViewTeam={(t) => {
                                setSelectedTenant(t);
                                fetchTenantUsers(t.id);
                            }}
                        />
                    )}

                    {activeTab === 'organization' && tenant && (
                        <OrganizationPanel tenantId={tenant.id} subView="members" />
                    )}
                    {activeTab === 'compliance' && tenant && (
                        <ComplianceTab tenantId={tenant.id} />
                    )}
                    {activeTab === 'affiliates' && <AffiliatePanel />}
                    {activeTab === 'settings' && <ConfigPanel tenant={tenant} refreshTenant={async () => {}} />}
                </div>
            </div>

            {/* Modals */}
            <ViewContentModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
            
            <TeamManagementModal 
                tenant={selectedTenant}
                users={tenantUsers}
                loading={isLoadingUsers}
                updatingUserPlan={updatingUserPlan}
                onUpdateUserPlan={handleUpdateUserPlan}
                onClose={() => setSelectedTenant(null)}
            />
        </div>
    );
};
