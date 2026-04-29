import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, ShieldCheck, Zap, Building, Crown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

interface PlansSectionProps {
    currentPlan: string;
    updatingPlan: string | null;
    onUpdatePlan: (planId: string) => Promise<void>;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
    currentPlan,
    updatingPlan,
    onUpdatePlan
}) => {
    const { t } = useTranslation();

    const plans = [
        {
            id: 'free',
            name: t('landing.pricing.plans.free.name'),
            tag: 'STARTER',
            price: '49€/mes',
            icon: Zap,
            color: 'from-blue-500/20 to-indigo-500/10',
            borderColor: 'group-hover:border-blue-500/40',
            glowColor: 'group-hover:shadow-blue-500/10',
            features: t('landing.pricing.plans.free.features', { returnObjects: true }) as string[] || []
        },
        {
            id: 'pro',
            name: t('landing.pricing.plans.pro.name'),
            tag: 'BUSINESS',
            price: '149€/mes',
            icon: Building,
            color: 'from-primary/20 to-primary/10',
            borderColor: 'group-hover:border-primary/40',
            glowColor: 'group-hover:shadow-primary/10',
            features: t('landing.pricing.plans.pro.features', { returnObjects: true }) as string[] || []
        },
        {
            id: 'business',
            name: t('landing.pricing.plans.business.name'),
            tag: 'ENTERPRISE',
            price: '399€/mes',
            icon: Crown,
            color: 'from-amber-500/20 to-amber-500/10',
            borderColor: 'group-hover:border-amber-500/40',
            glowColor: 'group-hover:shadow-amber-500/10',
            features: t('landing.pricing.plans.business.features', { returnObjects: true }) as string[] || []
        }
    ];

    return (
        <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <CreditCard size={180} className="text-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const isUpdating = updatingPlan === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "group relative bg-white/[0.02] backdrop-blur-xl border rounded-[32px] p-6 transition-all duration-500 overflow-hidden flex flex-col",
                                isCurrent 
                                    ? "border-primary/40 shadow-[0_20px_40px_-15px_rgba(var(--primary),0.15)] ring-1 ring-primary/20" 
                                    : cn("border-white/10", plan.borderColor, plan.glowColor)
                            )}
                        >
                            {/* Gradient Background */}
                            <div className={cn("absolute inset-0 bg-gradient-to-br -z-10 opacity-40 group-hover:opacity-60 transition-opacity", plan.color)} />
                            
                            {/* Current Plan Badge */}
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-primary/20 backdrop-blur-md px-4 py-1.5 rounded-bl-2xl border-b border-l border-primary/20">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Activo</span>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl border transition-all duration-500",
                                        isCurrent ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-slate-500 group-hover:text-white"
                                    )}>
                                        <plan.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan.tag}</div>
                                        <h4 className="text-xl font-black text-white">{plan.name}</h4>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white tracking-tighter">{plan.price.split('/')[0]}</span>
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">/ mes</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1 mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-2.5">
                                        <div className="p-0.5 rounded-full bg-primary/20 text-primary mt-0.5">
                                            <Check size={10} />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors leading-relaxed">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => !isCurrent && onUpdatePlan(plan.id)}
                                disabled={isCurrent || !!updatingPlan}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all relative overflow-hidden flex items-center justify-center gap-2",
                                    isCurrent 
                                        ? "bg-primary/10 text-primary border border-primary/20 cursor-default" 
                                        : "bg-white text-slate-900 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5 active:bg-slate-100"
                                )}
                            >
                                {isUpdating ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : isCurrent ? (
                                    <ShieldCheck size={18} />
                                ) : (
                                    <>Cambiar Plan</>
                                )}
                                {isCurrent ? 'Plan Actual' : isUpdating ? 'Procesando...' : ''}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 p-6 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">Método de Facturación</h4>
                        <p className="text-xs text-slate-500 mt-1">Los cambios de plan se prorratearán en tu próxima factura automáticamente.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all">
                    Gestionar Pagos
                </button>
            </div>
        </div>
    );
};
