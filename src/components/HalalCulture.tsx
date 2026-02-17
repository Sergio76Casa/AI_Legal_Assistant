import { useEffect } from 'react';
import { ArrowLeft, Heart, Utensils, Globe, Sparkles, ChevronRight, BookmarkCheck, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';

interface HalalCultureProps {
    onBack: () => void;
}

const sections = [
    {
        id: 'halal-food',
        icon: <Utensils className="w-6 h-6" />,
        title: 'Alimentación Halal',
        description: 'Guía de aditivos, sellos de certificación y consejos para el supermercado en Europa.',
        questions: [
            '¿Qué aditivos E son Haram?',
            '¿Cómo reconocer el sello del Instituto Halal?',
            '¿Es el E120 permitido en la dieta Halal?',
            'Consejos para comprar carne Halal en España'
        ]
    },
    {
        id: 'culture',
        icon: <Globe className="w-6 h-6" />,
        title: 'Protocolo y Cultura',
        description: 'Entiende las costumbres locales, saludos y festividades para una mejor integración.',
        questions: [
            '¿Cómo saludar respetuosamente en España?',
            '¿Cuáles son los horarios de comida típicos?',
            'Derechos laborales en festividades islámicas',
            'Calendario de festivos en España'
        ]
    },
    {
        id: 'community',
        icon: <Users2 className="w-6 h-6" />,
        title: 'Espacios de Comunidad',
        description: 'Información sobre centros culturales, mezquitas y asociaciones de apoyo.',
        questions: [
            '¿Dónde hay mezquitas en mi ciudad?',
            'Asociaciones de apoyo al inmigrante',
            'Centros culturales árabes en Madrid/Barcelona'
        ]
    }
];

export function HalalCulture({ onBack }: HalalCultureProps) {
    const { sendMessage } = useChat();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-emerald-50/30">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-emerald-700 hover:text-primary transition-colors group mb-12"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Volver al inicio</span>
                </button>

                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                                <Heart className="w-8 h-8 fill-current" />
                            </div>
                            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200">
                                Vida & Cultura
                            </span>
                        </div>
                        <h1 className="font-serif text-5xl text-gray-900 mb-6 leading-tight">
                            Tu Guía de <span className="text-emerald-600 italic">Vida Halal</span> y Cultura en España
                        </h1>
                        <p className="text-xl text-gray-600 font-light leading-relaxed">
                            Te ayudamos a mantener tus valores y sentirte como en casa. Información práctica sobre estilo de vida, alimentación y convivencia cultural.
                        </p>
                    </motion.div>
                </div>

                {/* Grid de Secciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    {section.icon}
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-serif text-2xl text-gray-900 mb-4">{section.title}</h3>
                            <p className="text-gray-600 mb-8 font-light min-h-[3rem]">{section.description}</p>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Consultar a STARK</p>
                                {section.questions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="w-full flex items-center justify-between p-4 bg-emerald-50/30 rounded-xl text-sm text-gray-700 hover:bg-emerald-600 hover:text-white transition-all text-left group/btn"
                                    >
                                        <span className="font-medium">{q}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Banner - Ayuda Directa */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] bg-emerald-950 text-white p-12 overflow-hidden mb-24"
                >
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-[url('https://images.unsplash.com/photo-1594910413061-0ae6b5809761?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/30">
                                <BookmarkCheck size={14} />
                                Expertos en Estilo de Vida
                            </div>
                            <h2 className="font-serif text-4xl mb-6 leading-tight">¿Dudas sobre un producto o costumbre?</h2>
                            <p className="text-emerald-100/80 text-lg font-light mb-8">
                                STARK está entrenado para responder cualquier duda sobre compatibilidad Halal o protocolo social en España. No te quedes con la duda.
                            </p>
                            <button
                                onClick={() => sendMessage('¿Cómo puedo saber si un producto es Halal en España?')}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                            >
                                Hablar con STARK ahora
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                <p className="italic text-emerald-50 font-light text-lg">
                                    "STARK me ayudó a entender por qué mis vecinos se saludaban de cierta forma y cómo pedir permiso en mi trabajo para el Eid. Ahora me siento mucho más integrada."
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">A</div>
                                    <span className="text-sm font-medium">Amina, residente en Madrid</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
