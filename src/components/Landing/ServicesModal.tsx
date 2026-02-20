import { useEffect } from 'react';
import { X, FileText, LayoutGrid, Building2, TrendingUp, Cpu, Shield, Globe } from 'lucide-react';

interface ServicesModalProps {
    type: 'documents' | 'templates' | 'organization' | 'affiliates' | null;
    onClose: () => void;
}

const contentMap = {
    documents: {
        title: 'Gestión Inteligente de Documentos',
        icon: FileText,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        description: 'Nuestra plataforma utiliza IA de última generación para analizar y organizar tus documentos legales de forma automática.',
        features: [
            { title: 'Análisis IA Experimental', desc: 'Extrae datos clave, fechas y obligaciones de cualquier PDF o imagen legal.' },
            { title: 'Tecnología Iron Silo™', desc: 'Tus documentos se cifran con estándares militares y se almacenan en servidores seguros de la UE.' },
            { title: 'Búsqueda Semántica', desc: 'Encuentra información dentro de tus documentos haciendo preguntas en lenguaje natural.' }
        ]
    },
    templates: {
        title: 'Plantillas PDF Dinámicas',
        icon: LayoutGrid,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        description: 'Reduce el trabajo administrativo creando documentos complejos en segundos utilizando nuestras plantillas inteligentes.',
        features: [
            { title: 'Generación Automática', desc: 'Rellena datos de clientes y casos automáticamente en tus modelos de contratos.' },
            { title: 'Personalización Total', desc: 'Adapta los logos, fuentes y estilos de cada documento a tu identidad corporativa.' },
            { title: 'Exportación Instantánea', desc: 'Genera archivos PDF listos para firmar con un solo clic.' }
        ]
    },
    organization: {
        title: 'Mi Organización Digital',
        icon: Building2,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        description: 'Toma el control total de tu marca y de cómo tus clientes interactúan con tu despacho o empresa.',
        features: [
            { title: 'Marca Blanca', desc: 'Personaliza tu portal con tus propios colores, logos y dominio personalizado.' },
            { title: 'Gestión de Sedes', desc: 'Configura múltiples oficinas físicas y puntos de contacto para tus clientes.' },
            { title: 'Control de Acceso', desc: 'Asigna roles y permisos específicos para cada miembro de tu equipo.' }
        ]
    },
    affiliates: {
        title: 'Programa de Afiliados Pro',
        icon: TrendingUp,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        description: 'Convierte tus recomendaciones en ingresos recurrentes uniéndote a nuestra red de partners.',
        features: [
            { title: 'Comisiones Recurrentes', desc: 'Gana un porcentaje de cada suscripción mensual de los clientes que refieras.' },
            { title: 'Panel de Control', desc: 'Monitoriza tus clics, registros y ganancias en tiempo real con estadísticas detalladas.' },
            { title: 'Material de Marketing', desc: 'Acceso a banners, enlaces y materiales diseñados para maximizar tus conversiones.' }
        ]
    }
};

export function ServicesModal({ type, onClose }: ServicesModalProps) {
    useEffect(() => {
        if (type) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [type]);

    if (!type) return null;

    const data = contentMap[type];
    const Icon = data.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center border ${data.color}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{data.title}</h2>
                            <p className="text-xs text-slate-500">Herramientas LegalFlow Platform</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-8">
                    <div className="space-y-4">
                        <p className="text-slate-400 leading-relaxed">
                            {data.description}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {data.features.map((feature, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                <div className="mt-1">
                                    <Cpu size={18} className="text-primary/60" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-primary/60">
                            <Shield size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider italic">Tecnología Certificada</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-8 py-3 bg-primary text-slate-900 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
