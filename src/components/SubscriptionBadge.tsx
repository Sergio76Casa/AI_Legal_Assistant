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

    const tier = (tenant?.plan || 'free').toLowerCase() as 'free' | 'pro' | 'business';

    const badges = {
        free: {
            icon: <Zap className="w-3 h-3" />,
            label: 'Free',
            classes: "bg-white/10 text-slate-300 border-white/15 hover:bg-white/15",
            features: ['1 Usuario', '5 Documentos/mes', 'Soporte Básico']
        },
        pro: {
            icon: <Crown className="w-3 h-3" />,
            label: 'Pro',
            classes: "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25",
            features: ['5 Usuarios', 'Documentos Ilimitados', 'Soporte Prioritario', 'Análisis Avanzado']
        },
        business: {
            icon: <Rocket className="w-3 h-3" />,
            label: 'Business',
            classes: "bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25",
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

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white">Plan Actual</h3>
                                <p className="text-xs text-slate-500">{tenant?.name || 'Personal'}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 hover:text-slate-300"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2 p-2 rounded-lg mb-4",
                            currentBadge.classes.replace('hover:', '')
                        )}>
                            <div className="p-1.5 bg-white/10 rounded-full">
                                {currentBadge.icon}
                            </div>
                            <span className="font-bold text-sm">{currentBadge.label} Plan</span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Incluye:</p>
                            {currentBadge.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                    <Check size={12} className="text-primary" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-2 bg-primary text-slate-900 text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                            Gestionar Suscripción
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
