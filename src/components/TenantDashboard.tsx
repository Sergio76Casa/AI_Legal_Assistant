import React, { useState } from 'react';
import { useTenant } from '../lib/TenantContext';
import { OrganizationPanel } from './OrganizationPanel';
import { UserDocuments } from './UserDocuments';
import { TemplateManager } from './TemplateManager';
import { AffiliatePanel } from './AffiliatePanel';
import { Building2, ArrowLeft, FileText, LayoutGrid, TrendingUp, Settings, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { ConfigPanel } from './ConfigPanel';

interface TenantDashboardProps {
    onBack?: () => void;
    onNavigate?: (view: any) => void;
    user: any;
    profile: any;
    initialTab?: string;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
    onBack,
    onNavigate,
    user,
    profile,
    initialTab = 'documents'
}) => {
    const { t } = useTranslation();
    const { tenant } = useTenant();
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

    if (!tenant) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-8 text-center text-slate-500">
                <Building2 size={48} className="mb-4 text-slate-600" />
                <h2 className="text-xl font-semibold text-white">{t('tenant_dashboard.not_found')}</h2>
                <p className="mt-2 text-slate-400">{t('tenant_dashboard.no_permission')}</p>
                <button
                    onClick={onBack}
                    className="mt-6 px-6 py-2 bg-primary text-slate-900 rounded-full font-bold hover:bg-primary/90 transition-all"
                >
                    {t('tenant_dashboard.back_home')}
                </button>
            </div>
        );
    }

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';

    const mainTabs = [
        { id: 'documents', label: t('tenant_dashboard.documents'), icon: FileText },
        { id: 'templates', label: t('tenant_dashboard.templates'), icon: LayoutGrid, adminOnly: true },
        { id: 'organization', label: t('tenant_dashboard.organization'), icon: Building2, adminOnly: true },
        { id: 'affiliates', label: t('tenant_dashboard.affiliates'), icon: TrendingUp },
        { id: 'settings', label: t('tenant_dashboard.settings'), icon: Settings, adminOnly: true },
    ];

    const organizationSubTabs = [
        { id: 'members', label: t('tenant_dashboard.subtabs.members'), icon: LayoutGrid },
        { id: 'invite', label: t('tenant_dashboard.subtabs.invite'), icon: PenTool },
        { id: 'signatures', label: t('tenant_dashboard.subtabs.signatures'), icon: PenTool },
    ];

    const filteredTabs = mainTabs.filter(tab => !tab.adminOnly || isAdmin);

    return (
        <div className="min-h-screen bg-[#0a0f1d] pb-20 pt-12">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                {/* 1. Bloque Superior (Identidad y Contexto) */}
                <div className="mb-10">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {t('tenant_dashboard.back')}
                    </button>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                        {tenant.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
                        <div className="flex items-center gap-2">
                            <span>{t('org_panel.headers.role') || 'Rol'}:</span>
                            <span className="text-primary font-black uppercase">{isAdmin ? t('org_panel.role_admin') : t('org_panel.role_user')}</span>
                        </div>
                        <span className="hidden xs:inline opacity-20">|</span>
                        <span className="lowercase tracking-[0.1em] opacity-80">{user?.email}</span>
                    </div>
                </div>

                {/* 2. Navegación Principal */}
                <div className="mb-4 flex items-center gap-1 bg-[#0f172a] p-1.5 rounded-2xl border border-white/5 w-full overflow-x-auto scrollbar-hide no-scrollbar">
                    {filteredTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden group min-w-[140px] md:min-w-0 md:max-w-none",
                                activeTab === tab.id
                                    ? "text-primary bg-primary/10 shadow-[inset_0_0_12px_rgba(19,236,200,0.05)]"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} className={cn(
                                "transition-transform duration-300",
                                activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="truncate whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_rgba(19,236,200,0.5)] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

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
                <div className="page-enter">
                    {activeTab === 'documents' && <UserDocuments userId={user.id} />}
                    {activeTab === 'templates' && <TemplateManager />}
                    {activeTab === 'organization' && (
                        <OrganizationPanel
                            tenantId={tenant.id}
                            subView={subTab as any}
                        />
                    )}
                    {activeTab === 'affiliates' && <AffiliatePanel />}
                    {activeTab === 'settings' && <ConfigPanel tenant={tenant} refreshTenant={async () => { window.location.reload(); }} />}
                </div>
            </div>
        </div>
    );
};
