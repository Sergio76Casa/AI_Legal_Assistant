import React, { useState } from 'react';
import { useTenant } from '../lib/TenantContext';
import { Crown, Zap, Rocket, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubscriptionBadgeProps {
    className?: string;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ className }) => {
    const { tenant } = useTenant();
    const [isOpen, setIsOpen] = useState(false);

    // Determine tier based on Tenant Plan (Priority) or Fallback to Free
    // This ensures consistency with Tenant Dashboard
    const tier = (tenant?.plan || 'free').toLowerCase() as 'free' | 'pro' | 'business';

    const badges = {
        free: {
            icon: <Zap className="w-3 h-3" />,
            label: 'Free',
            classes: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
            features: ['1 Usuario', '5 Documentos/mes', 'Soporte Básico']
        },
        pro: {
            icon: <Crown className="w-3 h-3" />,
            label: 'Pro',
            classes: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
            features: ['5 Usuarios', 'Documentos Ilimitados', 'Soporte Prioritario', 'Análisis Avanzado']
        },
        business: {
            icon: <Rocket className="w-3 h-3" />,
            label: 'Business',
            classes: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
            features: ['Usuarios Ilimitados', 'API Access', 'Soporte 24/7', 'Auditoría Legal', 'Marca Blanca']
        }
    };

    const currentBadge = badges[tier] || badges['free'];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                    currentBadge.classes,
                    className
                )}
            >
                {currentBadge.icon}
                {currentBadge.label}
            </button>

            {/* Plan Details Popover */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Plan Actual</h3>
                                <p className="text-xs text-slate-500">{tenant?.name || 'Personal'}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2 p-2 rounded-lg mb-4",
                            currentBadge.classes.replace('hover:', '') // Remove hover bg for static display
                        )}>
                            <div className="p-1.5 bg-white/50 rounded-full">
                                {currentBadge.icon}
                            </div>
                            <span className="font-bold text-sm">{currentBadge.label} Plan</span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Incluye:</p>
                            {currentBadge.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                    <Check size={12} className="text-emerald-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                            Gestionar Suscripción
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
