import React from 'react';
import { ShieldCheck, Server, Fingerprint, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Security = () => {
    const { t } = useTranslation();

    const securityFeatures = [
        {
            icon: Server,
            title: 'Arquitectura Iron Silo™',
            description: 'Cada organización opera en un clúster de datos físicamente aislado. Tus documentos y los de tus clientes nunca se mezclan con los de otros usuarios.'
        },
        {
            icon: Fingerprint,
            title: 'Trazabilidad Criptográfica SHA-256',
            description: 'Utilizamos algoritmos de alta seguridad para generar una huella digital única. Cualquier alteración posterior al documento invalidaría la firma automáticamente.'
        },
        {
            icon: ShieldCheck,
            title: 'Cumplimiento RGPD',
            description: 'Servidores ubicados en la Unión Europea con cifrado AES-256 tanto en reposo como en tránsito.'
        },
        {
            icon: Scale,
            title: 'Auditoría de Firmas',
            description: 'Registramos evidencias técnicas incuestionables (IP, Timestamp, User Agent) para proporcionar validez probatoria absoluta ante cualquier disputa legal.'
        }
    ];

    return (
        <section id="security" className="py-24 relative overflow-hidden bg-slate-950">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide uppercase mb-6">
                        <ShieldCheck size={16} />
                        Seguridad de Grado Legal
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Tu confianza es nuestra prioridad
                    </h2>
                    <p className="text-lg text-slate-400 font-medium">
                        En Legal AI Global, no solo almacenamos documentos; los protegemos bajo los estándares más estrictos de la industria tecnológica y legal.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {securityFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-[#151f38] hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

                            <div className="relative flex items-start gap-5">
                                <div className="p-4 bg-slate-900 rounded-2xl text-primary border border-white/5 shadow-[0_0_15px_rgba(19,236,200,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(19,236,200,0.2)] transition-all duration-300">
                                    <feature.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
