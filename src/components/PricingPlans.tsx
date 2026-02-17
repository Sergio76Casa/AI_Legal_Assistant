import React from 'react';
import { Check, X, Zap, Crown, Rocket } from 'lucide-react';

interface PricingTier {
    name: string;
    price: string;
    priceYearly: string;
    description: string;
    icon: React.ReactNode;
    features: { text: string; included: boolean }[];
    cta: string;
    highlighted?: boolean;
    tier: 'free' | 'pro' | 'business';
}

interface PricingPlansProps {
    currentTier?: 'free' | 'pro' | 'business';
    onSelectPlan?: (tier: 'free' | 'pro' | 'business') => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ currentTier = 'free', onSelectPlan }) => {
    const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

    const plans: PricingTier[] = [
        {
            name: 'Free',
            price: '€0',
            priceYearly: '€0',
            description: 'Perfecto para probar el servicio',
            icon: <Zap className="w-6 h-6" />,
            tier: 'free',
            features: [
                { text: '5 consultas al chat IA por mes', included: true },
                { text: '1 documento PDF (máx 5 MB)', included: true },
                { text: 'Búsqueda básica en documentos', included: true },
                { text: 'Acceso a guías públicas', included: true },
                { text: 'Soporte prioritario', included: false },
                { text: 'Análisis avanzado de documentos', included: false },
                { text: 'Exportación de consultas', included: false },
            ],
            cta: currentTier === 'free' ? 'Plan Actual' : 'Cambiar a Free',
        },
        {
            name: 'Pro',
            price: '€9.99',
            priceYearly: '€99',
            description: 'Para usuarios individuales y familias',
            icon: <Crown className="w-6 h-6" />,
            tier: 'pro',
            highlighted: true,
            features: [
                { text: '100 consultas al chat IA por mes', included: true },
                { text: '20 documentos PDF (máx 20 MB c/u)', included: true },
                { text: 'Búsqueda avanzada con filtros', included: true },
                { text: 'Análisis automático de documentos', included: true },
                { text: 'Exportar consultas a PDF/Word', included: true },
                { text: 'Soporte por email (48h)', included: true },
                { text: 'Historial ilimitado', included: true },
                { text: 'Notificaciones de cambios legales', included: true },
            ],
            cta: currentTier === 'pro' ? 'Plan Actual' : 'Actualizar a Pro',
        },
        {
            name: 'Business',
            price: '€29.99',
            priceYearly: '€299',
            description: 'Para profesionales y empresas',
            icon: <Rocket className="w-6 h-6" />,
            tier: 'business',
            features: [
                { text: 'Consultas ilimitadas', included: true },
                { text: 'Documentos ilimitados (máx 50 MB c/u)', included: true },
                { text: 'API access para integraciones', included: true },
                { text: 'Análisis masivo de documentos', included: true },
                { text: 'Plantillas legales personalizadas', included: true },
                { text: 'Soporte prioritario (24h)', included: true },
                { text: 'Múltiples usuarios (hasta 5)', included: true },
                { text: 'Dashboard de analytics', included: true },
                { text: 'Consultas con abogados (2h/mes)', included: true },
            ],
            cta: currentTier === 'business' ? 'Plan Actual' : 'Actualizar a Business',
        },
    ];

    return (
        <div className="py-12 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Elige el plan perfecto para ti
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                    Asesoramiento legal inteligente adaptado a tus necesidades
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-3 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'yearly'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Anual
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Ahorra 17%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.tier}
                        className={`relative rounded-2xl border-2 p-8 transition-all ${plan.highlighted
                                ? 'border-emerald-500 shadow-2xl scale-105 bg-gradient-to-br from-emerald-50 to-white'
                                : 'border-slate-200 hover:border-emerald-300 bg-white'
                            }`}
                    >
                        {/* Badge de Plan Actual */}
                        {currentTier === plan.tier && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                Tu Plan Actual
                            </div>
                        )}

                        {/* Badge de Más Popular */}
                        {plan.highlighted && currentTier !== plan.tier && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                ⭐ Más Popular
                            </div>
                        )}

                        {/* Icon */}
                        <div
                            className={`inline-flex p-3 rounded-lg mb-4 ${plan.highlighted
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {plan.icon}
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <p className="text-slate-600 text-sm mb-6">{plan.description}</p>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">
                                    {billingCycle === 'monthly' ? plan.price : plan.priceYearly}
                                </span>
                                <span className="text-slate-600">
                                    /{billingCycle === 'monthly' ? 'mes' : 'año'}
                                </span>
                            </div>
                            {billingCycle === 'yearly' && plan.tier !== 'free' && (
                                <p className="text-sm text-emerald-600 mt-1">
                                    Ahorra €{(parseFloat(plan.price.replace('€', '')) * 12 - parseFloat(plan.priceYearly.replace('€', ''))).toFixed(2)} al año
                                </p>
                            )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    {feature.included ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                                    )}
                                    <span
                                        className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'
                                            }`}
                                    >
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => onSelectPlan?.(plan.tier)}
                            disabled={currentTier === plan.tier}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${plan.highlighted
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed'
                                }`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mt-16 text-center">
                <p className="text-slate-600">
                    ¿Tienes preguntas? <a href="#" className="text-emerald-600 hover:underline font-medium">Contacta con nosotros</a>
                </p>
            </div>
        </div>
    );
};
