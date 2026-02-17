import React from 'react';
import { useTenant } from '../lib/TenantContext';
import { OrganizationPanel } from './OrganizationPanel';
import { Building2, Settings, ArrowLeft, FileText, ExternalLink } from 'lucide-react';

interface TenantDashboardProps {
    onBack?: () => void;
    onNavigate?: (view: any) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onBack, onNavigate }) => {
    const { tenant, loading } = useTenant();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando organización...</div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-8 text-center text-slate-500">
                <Building2 size={48} className="mb-4 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-700">No se encontró la organización</h2>
                <p className="mt-2">No tienes permisos para ver este panel o no perteneces a ninguna organización.</p>
                <button
                    onClick={onBack}
                    className="mt-6 text-sm text-emerald-600 hover:underline"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-8">
            <div className="mx-auto max-w-5xl px-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={onBack}
                            className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft size={14} /> Volver
                        </button>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                            <span className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <Building2 size={24} className="text-emerald-600" />
                            </span>
                            {tenant.name}
                        </h1>
                        <p className="mt-1 text-slate-500 ml-14">
                            Panel de Administración • Plan <span className="font-semibold uppercase text-emerald-600">{tenant.plan || 'Free'}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Documents Link */}
                        <button
                            onClick={() => onNavigate?.('documents')}
                            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 shadow-sm transition-all"
                        >
                            <FileText size={16} />
                            Documentos
                            <ExternalLink size={12} className="ml-1 opacity-50" />
                        </button>

                        {/* Settings Button */}
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                            <Settings size={16} />
                            Configuración
                        </button>
                    </div>
                </div>

                {/* Main Config Panel */}
                <div className="space-y-8">
                    {/* Team Management */}
                    <section>
                        <OrganizationPanel tenantId={tenant.id} />
                    </section>
                </div>
            </div>
        </div>
    );
};
