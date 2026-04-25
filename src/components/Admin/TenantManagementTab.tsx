import React from 'react';
import { Users, ExternalLink, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { PLAN_IDS, getPlanMetadata } from '../../lib/constants/plans';
import { ViewHeader } from './ViewHeader';

interface TenantManagementTabProps {
    tenants: any[];
    updatingPlan: string | null;
    planNames?: Record<string, string>;
    onUpdatePlan: (tenantId: string, newPlan: string) => void;
    onViewTeam: (tenant: any) => void;
}

export const TenantManagementTab: React.FC<TenantManagementTabProps> = ({
    tenants,
    updatingPlan,
    planNames,
    onUpdatePlan,
    onViewTeam
}) => {
    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Building2} 
                title="Organizaciones" 
                subtitle="Control de Arrendatarios y Suscripciones"
                badge="Multi-Tenant"
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white">Organizaciones en el Sistema</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tenants.length} Tenants</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                                    <th className="px-6 py-4">Organización</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4">Creado</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-white">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 font-mono gap-2 group-hover:bg-white/15 transition-colors">
                                                {tenant.slug}
                                                <a
                                                    href={`/${tenant.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {format(new Date(tenant.created_at), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={tenant.plan || PLAN_IDS.STARTER}
                                                onChange={(e) => onUpdatePlan(tenant.id, e.target.value)}
                                                disabled={updatingPlan === tenant.id}
                                                className={cn(
                                                    "px-2 py-1 rounded text-[10px] font-bold uppercase border-none focus:ring-1 focus:ring-primary cursor-pointer transition-all",
                                                    getPlanMetadata(tenant.plan, planNames).badgeClass
                                                )}
                                            >
                                                <option value={PLAN_IDS.STARTER}>{getPlanMetadata(PLAN_IDS.STARTER, planNames).commercialName}</option>
                                                <option value={PLAN_IDS.BUSINESS}>{getPlanMetadata(PLAN_IDS.BUSINESS, planNames).commercialName}</option>
                                                <option value={PLAN_IDS.ENTERPRISE}>{getPlanMetadata(PLAN_IDS.ENTERPRISE, planNames).commercialName}</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewTeam(tenant)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10"
                                            >
                                                <Users size={14} />
                                                Gestionar Equipo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
