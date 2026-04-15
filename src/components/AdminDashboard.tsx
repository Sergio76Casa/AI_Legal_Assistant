import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, RefreshCw, X, Building, Users, Shield, TrendingUp, Settings2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Shared Components
import { OrganizationPanel } from './OrganizationPanel';
import { AdminEarnings } from './Admin/AdminEarnings';
import { BusinessSettingsPanel } from './BusinessSettingsPanel';
import { useAppSettings } from '../lib/AppSettingsContext';

// Admin Sub-components
import { GlobalContentTab } from './Admin/GlobalContentTab';
import { TenantManagementTab } from './Admin/TenantManagementTab';
import { ViewContentModal } from './Admin/ViewContentModal';
import { TeamManagementModal } from './Admin/TeamManagementModal';
import { ComplianceTab } from './Admin/ComplianceTab';

// Hooks
import { useGlobalContent } from '../hooks/useGlobalContent';
import { useTenantControl } from '../hooks/useTenantControl';
import { useAdminAuth } from '../hooks/useAdminAuth';

export const AdminDashboard: React.FC = () => {
    const { settings } = useAppSettings();
    const [activeTab, setActiveTab] = useState<'content' | 'tenants' | 'organization' | 'earnings' | 'settings' | 'compliance'>('earnings');
    const [viewingDoc, setViewingDoc] = useState<{ name: string, content: string } | null>(null);

    // Hooks for business logic
    const { 
        globalDocuments, isUploading, uploadProgress, status: contentStatus, 
        setStatus: setContentStatus, fetchGlobalDocuments, handleUpload, handleDeleteDoc 
    } = useGlobalContent();

    const { 
        tenants, tenantUsers, selectedTenant, setSelectedTenant, 
        isLoadingUsers, updatingPlan, status: tenantStatus, 
        setStatus: setTenantStatus, fetchTenants, fetchTenantUsers, handleUpdatePlan 
    } = useTenantControl();

    const { userProfile } = useAdminAuth();

    // Sync all admin data
    const handleSync = useCallback(() => {
        fetchGlobalDocuments();
        fetchTenants();
        setContentStatus({ type: 'success', message: 'Datos de Legal AI Global sincronizados.' });
    }, [fetchGlobalDocuments, fetchTenants, setContentStatus]);

    useEffect(() => {
        handleSync();
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

    const status = contentStatus || tenantStatus;
    const setStatus = contentStatus ? setContentStatus : setTenantStatus;

    return (
        <div className="max-w-7xl mx-auto p-6 pt-24 min-h-screen">
            {/* Header & Tabs */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/15 rounded-xl text-primary border border-primary/20">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Legal AI Global Console</h1>
                            <p className="text-slate-400">Gestión global de leyes, organizaciones y sistema.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSync}
                            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            title="Sincronizar datos"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-white/5 rounded-xl w-full lg:w-fit overflow-hidden">
                    {[
                        { id: 'earnings', icon: <TrendingUp size={18} />, label: 'Mis Ganancias' },
                        { id: 'compliance', icon: <Shield size={18} />, label: 'Compliance Global' },
                        { id: 'content', icon: <Globe size={18} />, label: 'Leyes Globales' },
                        { id: 'tenants', icon: <Building size={18} />, label: 'Organizaciones (Control)' },
                        { id: 'organization', icon: <Users size={18} />, label: 'Configuración Propia' },
                        { id: 'settings', icon: <Settings2 size={18} />, label: 'Configuración de Negocio' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-3 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {status && (
                <div className={cn(
                    "mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    status.type === 'success' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{status.message}</span>
                    <button onClick={() => setStatus(null)} className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {activeTab === 'earnings' && <AdminEarnings />}
            
            {activeTab === 'compliance' && userProfile?.tenant_id && (
                <ComplianceTab tenantId={userProfile.tenant_id} />
            )}
            
            {activeTab === 'content' && (
                <GlobalContentTab 
                    documents={globalDocuments}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    onUpload={handleUpload}
                    onView={handleViewContent}
                    onDelete={handleDeleteDoc}
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

            {activeTab === 'organization' && userProfile?.tenant_id ? (
                <OrganizationPanel tenantId={userProfile.tenant_id} />
            ) : activeTab === 'organization' && (
                <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 italic text-slate-500">
                    No estás asociado a ninguna organización personal.
                </div>
            )}

            {activeTab === 'settings' && <BusinessSettingsPanel />}

            {/* Modals */}
            <ViewContentModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
            
            <TeamManagementModal 
                tenant={selectedTenant}
                users={tenantUsers}
                loading={isLoadingUsers}
                onClose={() => setSelectedTenant(null)}
            />
        </div>
    );
};

