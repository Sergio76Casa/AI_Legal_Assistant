import { useEffect } from 'react';
import { ArrowLeft, Home, FileCheck, Key, Sparkles, ChevronRight, HelpCircle, MapPin, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';
import { useTranslation, Trans } from 'react-i18next';

interface HousingGuideProps {
    onBack: () => void;
}

export function HousingGuide({ onBack }: HousingGuideProps) {
    const { t } = useTranslation();
    const { sendMessage } = useChat();

    const sections = [
        {
            id: 'contratos',
            icon: <FileCheck className="w-6 h-6" />,
            title: t('housing_page.items.contratos.title'),
            description: t('housing_page.items.contratos.desc'),
            questions: [
                t('housing_page.items.contratos.q1'),
                t('housing_page.items.contratos.q2'),
                t('housing_page.items.contratos.q3')
            ]
        },
        {
            id: 'requisitos',
            icon: <Key className="w-6 h-6" />,
            title: t('housing_page.items.requisitos.title'),
            description: t('housing_page.items.requisitos.desc'),
            questions: [
                t('housing_page.items.requisitos.q1'),
                t('housing_page.items.requisitos.q2'),
                t('housing_page.items.requisitos.q3')
            ]
        },
        {
            id: 'zonas',
            icon: <MapPin className="w-6 h-6" />,
            title: t('housing_page.items.zonas.title'),
            description: t('housing_page.items.zonas.desc'),
            questions: [
                t('housing_page.items.zonas.q1'),
                t('housing_page.items.zonas.q2'),
                t('housing_page.items.zonas.q3')
            ]
        },
        {
            id: 'suministros',
            icon: <Droplets className="w-6 h-6" />,
            title: t('housing_page.items.suministros.title'),
            description: t('housing_page.items.suministros.desc'),
            questions: [
                t('housing_page.items.suministros.q1'),
                t('housing_page.items.suministros.q2'),
                t('housing_page.items.suministros.q3')
            ]
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0f1d]">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-12"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">{t('housing_page.back')}</span>
                </button>

                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl text-primary shadow-sm border border-white/10">
                                <Home className="w-8 h-8" />
                            </div>
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                {t('landing.trust_bar.gdpr')}
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
                            <Trans i18nKey="housing_page.title">
                                Guía de <span className="text-secondary italic">Vivienda & Alquiler</span>
                            </Trans>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed">
                            {t('housing_page.desc')}
                        </p>
                    </motion.div>
                </div>

                {/* Grid de Secciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/5 hover:border-primary/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl text-slate-300 group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                                    {section.icon}
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-serif text-2xl text-white mb-4">{section.title}</h3>
                            <p className="text-slate-400 mb-8 font-light min-h-[3rem] text-sm md:text-base">{section.description}</p>

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('housing_page.common_steps')}</p>
                                {section.questions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-primary hover:text-slate-900 transition-all text-left group/btn"
                                    >
                                        <span className="font-medium line-clamp-2">{q}</span>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
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
                    className="relative rounded-[2.5rem] bg-slate-900 text-white p-8 sm:p-12 overflow-hidden mb-24 border border-white/10"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/20">
                                <HelpCircle size={14} />
                                Verificación de Contratos
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl mb-6 leading-tight">¿Vas a firmar un nuevo contrato?</h2>
                            <p className="text-slate-400 text-base sm:text-lg font-light mb-8 max-w-xl">
                                Sube el borrador de tu contrato ahora. STARK analizará si tiene cláusulas abusivas, si la fianza es legal y si cumple con la nueva Ley de Vivienda 2023.
                            </p>
                            <button
                                onClick={onBack}
                                className="px-8 py-4 bg-primary text-slate-900 rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 w-full sm:w-auto"
                            >
                                {t('housing_page.btn_ask')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
