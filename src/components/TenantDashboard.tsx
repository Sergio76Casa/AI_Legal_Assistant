import React, { useState } from 'react';
import { useTenant } from '../lib/TenantContext';
import { OrganizationPanel } from './OrganizationPanel';
import { UserDocuments } from './UserDocuments';
import { TemplateManager } from './TemplateManager';
import { AffiliatePanel } from './AffiliatePanel';
import { Building2, ArrowLeft, FileText, LayoutGrid, TrendingUp, Settings } from 'lucide-react';
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

    React.useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onNavigate?.(tabId);
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

    const tabs = [
        { id: 'documents', label: 'Mis Documentos', icon: FileText },
        { id: 'templates', label: 'Plantillas PDF', icon: LayoutGrid, adminOnly: true },
        { id: 'organization', label: 'Mi Organización', icon: Building2, adminOnly: true },
        { id: 'affiliates', label: 'Programa de Afiliados', icon: TrendingUp },
        { id: 'settings', label: 'Configuración', icon: Settings, adminOnly: true },
    ];

    const filteredTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    return (
        <div className="min-h-screen bg-[#0a0f1d] pb-20 pt-12">
            <div className="mx-auto max-w-6xl px-6">
                {/* 1. Bloque Superior (Identidad y Contexto) */}
                <div className="mb-12">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {t('tenant_dashboard.back')}
                    </button>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                        {tenant.name}
                    </h1>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
                        <span>Rol:</span>
                        <span className="text-primary font-black">{isAdmin ? 'Administrador' : 'Usuario'}</span>
                        <span className="mx-2 opacity-20">|</span>
                        <span className="uppercase tracking-[0.15em]">Email: <span className="text-slate-500 font-bold not-italic">{user?.email}</span></span>
                    </div>
                </div>

                {/* 2. Navegación en Fila (Secciones Horizontales) */}
                <div className="mb-12 flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-white/5 w-full overflow-x-auto">
                    {filteredTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden group",
                                activeTab === tab.id
                                    ? "text-primary bg-primary/10 shadow-[inset_0_0_12px_rgba(19,236,200,0.05)]"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={14} className={cn(
                                "transition-transform duration-300",
                                activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="truncate">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary shadow-[0_0_8px_rgba(19,236,200,0.5)] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* 3. Contenido Dinámico */}
                <div className="page-enter">
                    {activeTab === 'documents' && <UserDocuments userId={user.id} />}
                    {activeTab === 'templates' && <TemplateManager />}
                    {activeTab === 'organization' && <OrganizationPanel tenantId={tenant.id} />}
                    {activeTab === 'affiliates' && <AffiliatePanel />}
                    {activeTab === 'settings' && <ConfigPanel />}
                </div>
            </div>
        </div>
    );
};
