import { useState } from 'react';
import { motion } from 'framer-motion';

interface PricingProps {
    onCreateOrg: () => void;
    onBookDemo?: () => void;
}

export function Pricing({ onCreateOrg, onBookDemo }: PricingProps) {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            target: 'Profesionales Independientes',
            description: 'Ideal para gestores, consultores y expertos en movilidad que gestionan pocos expedientes al mes.',
            price: { monthly: 49, yearly: 470 },
            icon: 'person',
            popular: false,
            cta: 'Comenzar Ahora',
            features: [
                'Hasta 10 expedientes nuevos/mes',
                'Escaneo inteligente de documentos (OCR)',
                'Acceso al Motor STARK 2.0 básico',
                'Panel de gestión de casos',
                'Soporte vía email'
            ]
        },
        {
            id: 'business',
            name: 'Business',
            target: 'Despachos y Agencias',
            description: 'Diseñado para despachos, agencias de relocation y consultorías que necesitan velocidad y colaboración.',
            price: { monthly: 149, yearly: 1430 },
            icon: 'groups',
            popular: true,
            cta: 'Elegir Business',
            features: [
                'Hasta 50 expedientes nuevos/mes',
                'Seguridad Iron Silo™ avanzada',
                'Hasta 3 cuentas de usuario (gestores)',
                'Traducción automática de documentos',
                'Motor STARK 2.0 completo',
                'Soporte prioritario 24/7'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            target: 'Grandes Firmas y Corporaciones',
            description: 'Para organizaciones con alto volumen de expedientes, departamentos de RRHH y necesidad de personalización.',
            price: { monthly: 399, yearly: null },
            icon: 'domain',
            popular: false,
            cta: 'Contactar Ventas',
            features: [
                'Expedientes ilimitados',
                'Integración vía API con sistemas propios',
                'Arquitectura Multi-Tenant dedicada',
                'Formación personalizada para el equipo',
                'Gestor de cuenta exclusivo',
                'SLA garantizado'
            ]
        }
    ];

    return (
        <section id="pricing" className="py-24 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
                    Planes & Precios
                </h2>
                <h3 className="font-serif text-4xl md:text-5xl text-white">
                    Escala tu negocio con <span className="text-primary">IA legal</span>
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Elige el plan que mejor se adapte al volumen de tu despacho o agencia. Sin contratos de permanencia.
                </p>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
                <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>
                    Mensual
                </span>
                <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`}></div>
                </button>
                <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>
                    Anual
                </span>
                {isYearly && (
                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold border border-primary/30 animate-pulse">
                        🎁 2 meses gratis
                    </span>
                )}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.5 }}
                        viewport={{ once: true }}
                        className={`relative glass-card rounded-3xl p-8 flex flex-col group transition-all duration-300
                            ${plan.popular
                                ? 'border-primary/40 ring-1 ring-primary/20 md:scale-105 z-10 bg-gradient-to-b from-primary/5 to-transparent'
                                : 'border-white/5 hover:border-primary/20'}`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-primary/30 uppercase tracking-wider whitespace-nowrap">
                                ⭐ El más popular
                            </div>
                        )}
                        {/* Icon + Name */}
                        <div className="mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400'}`}>
                                <span className="material-symbols-outlined text-2xl">{plan.icon}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-white">{plan.name}</h4>
                            <p className="text-primary/80 text-xs font-bold tracking-widest uppercase mt-1">{plan.target}</p>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="mb-8 pb-8 border-b border-white/5">
                            <div className="flex items-baseline gap-1">
                                {plan.price.yearly === null ? (
                                    <>
                                        <span className="text-lg text-slate-400 font-medium">Desde</span>
                                        <span className="text-5xl font-black text-white tracking-tight ml-2">
                                            {plan.price.monthly}€
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-5xl font-black text-white tracking-tight">
                                        {isYearly ? `${plan.price.yearly}€` : `${plan.price.monthly}€`}
                                    </span>
                                )}
                                <span className="text-slate-500 text-sm font-medium">
                                    /{isYearly && plan.price.yearly ? 'año' : 'mes'}
                                </span>
                            </div>
                            {isYearly && plan.price.yearly && (
                                <p className="text-emerald-400 text-xs mt-2 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">savings</span>
                                    Ahorras {plan.price.monthly * 12 - plan.price.yearly}€ al año (2 meses gratis)
                                </p>
                            )}
                            {plan.price.yearly === null && (
                                <p className="text-slate-500 text-xs mt-2">Presupuesto a medida</p>
                            )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 flex-1 mb-8">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className={`material-symbols-outlined text-base mt-0.5 ${plan.popular ? 'text-primary' : 'text-emerald-500'}`}>check_circle</span>
                                    <span className="text-slate-300">{feat}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={onCreateOrg}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-lg
                                ${plan.popular
                                    ? 'bg-primary text-slate-900 hover:brightness-110 shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.05]'
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-primary/30'}`}
                        >
                            {plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-16 space-y-3">
                <p className="text-slate-500 text-sm">
                    💳 Pago seguro con Stripe • ✅ Sin permanencia • 🔒 Datos protegidos con Iron Silo™
                </p>
                <p className="text-slate-600 text-xs">
                    ¿Necesitas más de 50 expedientes?{' '}
                    <button onClick={onBookDemo} className="text-primary hover:underline font-medium cursor-pointer">Habla con nuestro equipo comercial →</button>
                </p>
            </div>
        </section>
    );
}
