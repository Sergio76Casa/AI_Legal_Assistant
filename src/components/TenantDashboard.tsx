import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTenant } from '../lib/TenantContext';
import { OrganizationPanel } from './OrganizationPanel';
import { UserDocuments } from './UserDocuments';
import { TemplateManager } from './TemplateManager';
import { AffiliatePanel } from './AffiliatePanel';
import { Building2, FileText, LayoutGrid, Settings, PenTool, Shield, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { ComplianceTab } from './Admin/ComplianceTab';
import { ConfigPanel } from './ConfigPanel';
import { HealthMonitorPanel } from './HealthMonitorPanel';
import { Sidebar } from './Sidebar';
import { useAppSettings } from '../lib/AppSettingsContext';
import { getPlanMetadata } from '../lib/constants/plans';
import { HomeView } from './HomeView';

interface TenantDashboardProps {
    onBack?: () => void;
    onNavigate?: (view: any) => void;
    user: any;
    profile: any;
    initialTab?: string;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
    onNavigate,
    user,
    profile,
    initialTab = 'home'
}) => {
    const { t } = useTranslation();
    const { tenant, refreshTenant } = useTenant();
    const { settings } = useAppSettings();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [subTab, setSubTab] = useState('members');

    React.useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onNavigate?.(tabId);
        if (tabId === 'organization') setSubTab('members');
    };

    const virtualTenant = tenant || {
        id: 'personal',
        name: t('tenant_dashboard.personal_workspace', { defaultValue: 'Espacio Personal' }),
        plan: profile?.plan || 'Free',
        slug: 'personal',
        config: {}
    };

    const displayTenant = virtualTenant;
    const planMetadata = getPlanMetadata(profile?.subscription_tier || tenant?.plan || 'free', settings?.plan_names);

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';

    const mainTabs = [
        { id: 'home', label: 'Mi Dashboard', icon: TrendingUp, category: 'Espacio de Trabajo' },
        { id: 'documents', label: t('tenant_dashboard.documents'), icon: FileText, category: 'Espacio de Trabajo' },
        { id: 'templates', label: t('tenant_dashboard.templates'), icon: LayoutGrid, adminOnly: true, category: 'Espacio de Trabajo' },
        { id: 'compliance', label: 'Eficiencia Stark', icon: Shield, adminOnly: true, category: 'Recursos' },
        { id: 'organization', label: t('tenant_dashboard.organization'), icon: Building2, adminOnly: true, category: 'Gestión' },
        { id: 'affiliates', label: t('tenant_dashboard.affiliates'), icon: TrendingUp, category: 'Gestión' },
        { id: 'settings', label: t('tenant_dashboard.settings'), icon: Settings, adminOnly: true, category: 'Sistema' },
    ];

    const organizationSubTabs = [
        { id: 'members', label: t('tenant_dashboard.subtabs.members'), icon: LayoutGrid },
        { id: 'invite', label: t('tenant_dashboard.subtabs.invite'), icon: PenTool },
        { id: 'signatures', label: t('tenant_dashboard.subtabs.signatures'), icon: PenTool },
    ];

    const filteredTabs = mainTabs.filter(tab => {
        if (tab.adminOnly && !tenant) return false;
        return !tab.adminOnly || isAdmin;
    });

    return (
        <div className={cn(
            "min-h-screen bg-[#0a0f1d] flex",
            settings?.navigation_style === 'sidebar' ? "flex-row" : "flex-col pb-32 pt-32"
        )}>
            {settings?.navigation_style === 'sidebar' && (
                <Sidebar 
                    navItems={filteredTabs}
                    activeTab={activeTab === 'home' ? 'documents' : activeTab}
                    onTabChange={handleTabChange}
                    user={user}
                    profile={profile}
                    tenant={tenant}
                    planMetadata={planMetadata}
                />
            )}

            <div className={cn(
                "flex-1 w-full min-w-0",
                settings?.navigation_style === 'sidebar' ? "p-6 md:px-10 lg:px-16 pt-20" : "mx-auto max-w-[1400px] px-6"
            )}>

                {/* 2. Navegación Principal */}
                {settings?.navigation_style !== 'sidebar' && (
                    <div className="mb-12 flex items-center gap-1 p-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] w-full overflow-x-auto no-scrollbar shadow-2xl">
                        {filteredTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "relative flex items-center justify-center gap-2 px-8 py-5 rounded-[1.5rem] text-[11px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap overflow-hidden group min-w-[160px] flex-1",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            <tab.icon size={16} className={cn(
                                "transition-transform duration-300",
                                activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="truncate">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTabTenant"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                    </div>
                )}

                {/* 3. Sub-Navegación para Organización */}
                {activeTab === 'organization' && (
                    <div className="mb-10 flex items-center gap-4 px-2 overflow-x-auto scrollbar-hide no-scrollbar">
                        {organizationSubTabs.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSubTab(sub.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                    subTab === sub.id
                                        ? "text-primary bg-primary/5 border border-primary/20"
                                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                                )}
                            >
                                <sub.icon size={14} />
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* 4. Contenido Dinámico */}
                <div>
                    {activeTab === 'home' && <HomeView />}
                    {activeTab === 'documents' && <UserDocuments userId={user.id} />}
                    {activeTab === 'compliance' && <ComplianceTab tenantId={displayTenant.id} />}
                    {activeTab === 'templates' && <TemplateManager />}
                    {activeTab === 'organization' && (
                        <OrganizationPanel
                            tenantId={displayTenant.id}
                            subView={subTab as any}
                        />
                    )}
                    {activeTab === 'affiliates' && <AffiliatePanel />}
                    {activeTab === 'health' && <HealthMonitorPanel />}
                    {activeTab === 'settings' && tenant && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ConfigPanel
                                tenant={displayTenant}
                                refreshTenant={refreshTenant}
                            />
                        </div>
                    )}
                </div>

                {/* 5. Trust Badge Footer */}
                <div className="mt-16 flex justify-center pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#0f172a]/80 backdrop-blur-md border border-primary/10 shadow-[0_4px_20px_rgba(19,236,200,0.03)] group hover:border-primary/30 transition-all cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <Shield className="text-primary" size={18} />
                        <span className="text-xs font-semibold text-slate-400 tracking-wide">
                            Protección <strong className="text-white">Iron Silo™</strong> Activa: Datos Físicamente Aislados
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
