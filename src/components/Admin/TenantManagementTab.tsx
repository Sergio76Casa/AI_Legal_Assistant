import React from 'react';
import { Users, ExternalLink, Building2, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="page-enter space-y-12 min-w-0 flex-1">
            <ViewHeader 
                icon={Building2} 
                title="Organizaciones" 
                subtitle="Control de Arrendatarios y Suscripciones"
                badge="Multi-Tenant"
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 space-y-8">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-black text-white text-lg tracking-tight uppercase tracking-[0.2em] text-[11px] opacity-50">
                        Entidades en el Sistema
                    </h3>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        {tenants.length} Registradas
                    </span>
                </div>

                {/* Desktop Table View (xl+) */}
                <div className="hidden xl:block bg-[#0A0F1D]/40 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-8 py-6">Organización</th>
                                <th className="px-8 py-6">Identificador (Slug)</th>
                                <th className="px-8 py-6">Fecha Registro</th>
                                <th className="px-8 py-6">Plan de Suscripción</th>
                                <th className="px-8 py-6 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-sm border border-primary/20 shadow-inner shrink-0 text-xl">
                                                {tenant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-black text-white group-hover:text-primary transition-colors whitespace-normal break-all">
                                                {tenant.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-slate-400 group-hover:border-primary/20 transition-all">
                                            <span className="break-all">{tenant.slug}</span>
                                            <a
                                                href={`/${tenant.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-500 hover:text-primary transition-colors shrink-0"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                                            <Calendar size={14} className="opacity-40" />
                                            {format(new Date(tenant.created_at), 'dd MMM yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="relative group/select w-fit">
                                            <select
                                                value={tenant.plan || PLAN_IDS.STARTER}
                                                onChange={(e) => onUpdatePlan(tenant.id, e.target.value)}
                                                disabled={updatingPlan === tenant.id}
                                                className={cn(
                                                    "appearance-none cursor-pointer outline-none bg-white/5 border border-white/10 px-4 py-2 pr-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 disabled:opacity-50",
                                                    getPlanMetadata(tenant.plan, planNames).badgeClass
                                                )}
                                            >
                                                <option value={PLAN_IDS.STARTER} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.STARTER, planNames).commercialName}</option>
                                                <option value={PLAN_IDS.BUSINESS} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.BUSINESS, planNames).commercialName}</option>
                                                <option value={PLAN_IDS.ENTERPRISE} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.ENTERPRISE, planNames).commercialName}</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                <CreditCard size={12} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => onViewTeam(tenant)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/0 hover:shadow-primary/20 hover:text-white shrink-0"
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

                {/* Mobile Card View (< xl) */}
                <div className="xl:hidden grid grid-cols-1 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {tenants.map((tenant, idx) => (
                            <motion.div
                                key={tenant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#0A0F1D]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-6 shadow-2xl flex flex-col gap-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-black text-2xl border border-primary/20 shadow-inner shrink-0">
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-white text-lg tracking-tight whitespace-normal break-all mb-1">
                                                {tenant.name}
                                            </h4>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 w-fit">
                                                <span className="text-[10px] font-mono text-slate-500 break-all">{tenant.slug}</span>
                                                <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-primary">
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-500/20 shrink-0">
                                        ACTIVO
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[8px] font-black uppercase tracking-wider text-slate-500 mb-1">Registro</div>
                                        <div className="text-[10px] font-black text-white uppercase">{format(new Date(tenant.created_at), 'dd/MM/yyyy')}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[8px] font-black uppercase tracking-wider text-slate-500 mb-1">Equipo</div>
                                        <div className="text-[10px] font-black text-white uppercase">Sincronizado</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Plan de Suscripción</div>
                                    <div className="relative group/select w-full">
                                        <select
                                            value={tenant.plan || PLAN_IDS.STARTER}
                                            onChange={(e) => onUpdatePlan(tenant.id, e.target.value)}
                                            disabled={updatingPlan === tenant.id}
                                            className={cn(
                                                "w-full appearance-none cursor-pointer outline-none bg-white/5 border border-white/10 px-4 py-3 pr-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10",
                                                getPlanMetadata(tenant.plan, planNames).badgeClass
                                            )}
                                        >
                                            <option value={PLAN_IDS.STARTER} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.STARTER, planNames).commercialName}</option>
                                            <option value={PLAN_IDS.BUSINESS} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.BUSINESS, planNames).commercialName}</option>
                                            <option value={PLAN_IDS.ENTERPRISE} className="bg-slate-900">{getPlanMetadata(PLAN_IDS.ENTERPRISE, planNames).commercialName}</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                            <CreditCard size={14} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onViewTeam(tenant)}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[50px]"
                                >
                                    <Users size={18} />
                                    Gestionar Equipo Completo
                                    <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
