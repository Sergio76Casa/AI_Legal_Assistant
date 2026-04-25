import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Globe, RefreshCw, Building, Users, TrendingUp, Settings2, Shield, FileText, LayoutGrid } from 'lucide-react';
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

export const AdminDashboard: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
    const { settings } = useAppSettings();
    const [activeTab, setActiveTab] = useState<string>(
        initialTab === 'admin' ? 'earnings' : (initialTab || 'earnings')
    );

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

    const isSuperAdmin = userProfile?.role === 'superadmin' || user?.email === 'lsergiom76@gmail.com';

    const navItems = [
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

    // UI Logic for status notifications could go here, but currently unused globally inside the return
    // const status = contentStatus || tenantStatus;
    // const setStatus = contentStatus ? setContentStatus : setTenantStatus;

    return (
        <div className={cn(
            "min-h-screen bg-[#0a0f1d] flex",
            settings?.navigation_style === 'sidebar' ? "flex-row" : "flex-col pb-24 pt-24"
        )}>
            {settings?.navigation_style === 'sidebar' && (
                <Sidebar 
                    navItems={navItems}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                    user={user}
                    profile={userProfile}
                    tenant={tenant}
                    planMetadata={planMetadata}
                />
            )}
            
            <div className={cn(
                "flex-1 w-full min-w-0",
                settings?.navigation_style === 'sidebar' ? "p-6 md:px-10 lg:px-16 pt-20" : "mx-auto max-w-[1400px] px-6"
            )}>
                {/* Tabs Navigation and Sync Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {settings?.navigation_style !== 'sidebar' ? (
                        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] w-full lg:w-fit overflow-hidden shadow-2xl">
                            {navItems.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "relative flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-[11px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap overflow-hidden group",
                                        activeTab === tab.id
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : <div />}
                    {/* Botón Sincronizar */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 group bg-slate-900/30 backdrop-blur-sm disabled:opacity-50"
                            title="Sincronizar datos"
                        >
                            <RefreshCw size={20} className={cn("transition-transform duration-700", isSyncing ? "animate-spin text-primary" : "group-hover:rotate-180")} />
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                            </span>
                        </button>
                    </div>
                    {syncStatus && (
                        <div className="flex justify-end mt-2 animate-in slide-in-from-right fade-in">
                             <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                 syncStatus.type === 'success' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                             )}>
                                {syncStatus.message}
                             </span>
                        </div>
                    )}
                </div>

                {/* 3. Contenido Dinámico */}
                <div key={refreshKey} className="space-y-10">
                    {activeTab === 'earnings' && <AdminEarnings />}
                    {activeTab === 'documents' && <UserDocuments userId={user?.id} />}
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
