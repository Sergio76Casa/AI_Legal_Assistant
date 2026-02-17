import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home, FileCheck, ShieldAlert, Key, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';

interface HousingGuideProps {
    onBack: () => void;
}

const sections = [
    {
        id: 'contracts',
        icon: <FileCheck className="w-6 h-6" />,
        title: 'Tipos de Contrato',
        description: 'Vivienda habitual vs. temporada. Conoce tus derechos según la Ley de Arrendamientos Urbanos (LAU).',
        questions: [
            '¿Cuál es la duración mínima de un contrato de alquiler?',
            'Diferencia entre contrato de temporada y vivienda habitual',
            '¿Puedo dejar el piso antes de los 6 meses?',
            '¿Qué es la prórroga automática del contrato?'
        ]
    },
    {
        id: 'deposits',
        icon: <Key className="w-6 h-6" />,
        title: 'Fianzas y Pagos',
        description: 'Todo sobre la fianza legal, garantías adicionales y quién debe pagar los honorarios de la agencia.',
        questions: [
            '¿Cuántos meses de fianza son obligatorios?',
            '¿Quién paga la inmobiliaria según la nueva ley?',
            '¿Cómo recuperar mi fianza si no me la devuelven?',
            '¿Puede el casero pedirme 6 meses de depósito?'
        ]
    },
    {
        id: 'rights',
        icon: <ShieldAlert className="w-6 h-6" />,
        title: 'Derechos del Inquilino',
        description: 'Reparaciones, suministros y protección ante desahucios u otros abusos.',
        questions: [
            '¿Quién paga las averías de la caldera o electrodomésticos?',
            '¿Puede el casero entrar en mi casa sin permiso?',
            '¿Qué hacer si me quieren subir el alquiler de golpe?',
            'Derechos ante un aviso de fin de contrato'
        ]
    }
];

export function HousingGuide({ onBack }: HousingGuideProps) {
    const { t } = useTranslation();
    const { sendMessage } = useChat();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-stone-50/30">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-stone-500 hover:text-primary transition-colors group mb-12"
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
                            <div className="p-3 bg-white rounded-2xl text-stone-900 shadow-sm border border-stone-100">
                                <Home className="w-8 h-8" />
                            </div>
                            <span className="bg-stone-200 text-stone-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-stone-300">
                                Vivienda & Alquiler
                            </span>
                        </div>
                        <h1 className="font-serif text-5xl text-gray-900 mb-6 leading-tight">
                            Protección y Guía para tu <span className="text-secondary italic">Hogar en España</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-light leading-relaxed">
                            No te dejes engañar por contratos abusivos. Te ayudamos a entender la ley de vivienda, verificar tus derechos y asegurar tu fianza.
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
                            className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-stone-50 rounded-2xl text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
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
                                        className="w-full flex items-center justify-between p-4 bg-stone-50/50 rounded-xl text-sm text-gray-700 hover:bg-stone-900 hover:text-white transition-all text-left group/btn"
                                    >
                                        <span className="font-medium">{q}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Banner - Verificación de Contratos */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] bg-stone-900 text-white p-12 overflow-hidden mb-24"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-500/20 text-stone-300 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-stone-500/30">
                                <HelpCircle size={14} />
                                Verificación de Contratos
                            </div>
                            <h2 className="font-serif text-4xl mb-6 leading-tight">¿Vas a firmar un nuevo contrato?</h2>
                            <p className="text-stone-300 text-lg font-light mb-8">
                                Sube el borrador de tu contrato ahora. STARK analizará si tiene cláusulas abusivas, si la fianza es legal y si cumple con la nueva Ley de Vivienda 2023.
                            </p>
                            <button
                                onClick={onBack}
                                className="px-8 py-4 bg-white text-stone-900 rounded-full font-bold hover:bg-stone-200 transition-all shadow-lg active:scale-95"
                            >
                                Subir Contrato para Análisis
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-stone-200">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                                        <span>Detección de honorarios ilegales</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-stone-200">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                                        <span>Verificación de prórrogas legales</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-stone-200">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</div>
                                        <span>Cálculo de suministros y gastos</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
