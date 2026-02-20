import { useEffect } from 'react';
import { ArrowLeft, Heart, Utensils, Globe, Sparkles, ChevronRight, BookmarkCheck, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '../lib/ChatContext';
import { useTranslation, Trans } from 'react-i18next';

interface HalalCultureProps {
    onBack: () => void;
}

export function HalalCulture({ onBack }: HalalCultureProps) {
    const { t } = useTranslation();
    const { sendMessage } = useChat();

    const sections = [
        {
            id: 'alimentacion',
            icon: <Utensils className="w-6 h-6" />,
            title: t('halal_page.items.alimentacion.title'),
            description: t('halal_page.items.alimentacion.desc'),
            questions: [
                t('halal_page.items.alimentacion.q1'),
                t('halal_page.items.alimentacion.q2'),
                t('halal_page.items.alimentacion.q3')
            ]
        },
        {
            id: 'mezquitas',
            icon: <Globe className="w-6 h-6" />,
            title: t('halal_page.items.mezquitas.title'),
            description: t('halal_page.items.mezquitas.desc'),
            questions: [
                t('halal_page.items.mezquitas.q1'),
                t('halal_page.items.mezquitas.q2'),
                t('halal_page.items.mezquitas.q3')
            ]
        },
        {
            id: 'derechos',
            icon: <Briefcase className="w-6 h-6" />,
            title: t('halal_page.items.derechos.title'),
            description: t('halal_page.items.derechos.desc'),
            questions: [
                t('halal_page.items.derechos.q1'),
                t('halal_page.items.derechos.q2'),
                t('halal_page.items.derechos.q3')
            ]
        },
        {
            id: 'educacion',
            icon: <GraduationCap className="w-6 h-6" />,
            title: t('halal_page.items.educacion.title'),
            description: t('halal_page.items.educacion.desc'),
            questions: [
                t('halal_page.items.educacion.q1'),
                t('halal_page.items.educacion.q2'),
                t('halal_page.items.educacion.q3')
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
                    <span className="font-medium">{t('halal_page.back')}</span>
                </button>

                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl text-emerald-400 shadow-sm border border-white/10">
                                <Heart className="w-8 h-8 fill-current" />
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                {t('landing.trust_bar.secured')}
                            </span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
                            <Trans i18nKey="halal_page.title">
                                Vida <span className="text-emerald-400 italic">Halal & Cultural</span>
                            </Trans>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed">
                            {t('halal_page.desc')}
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
                            className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/5 hover:border-emerald-500/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    {section.icon}
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-serif text-2xl text-white mb-4">{section.title}</h3>
                            <p className="text-slate-400 mb-8 font-light min-h-[3rem] text-sm md:text-base">{section.description}</p>

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('halal_page.common_topics')}</p>
                                {section.questions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-emerald-600 hover:text-white transition-all text-left group/btn"
                                    >
                                        <span className="font-medium line-clamp-2">{q}</span>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
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
                    className="relative rounded-[2.5rem] bg-emerald-950/30 text-white p-8 sm:p-12 overflow-hidden mb-24 border border-emerald-500/10"
                >
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-[url('https://images.unsplash.com/photo-1594910413061-0ae6b5809761?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-emerald-500/30">
                                <BookmarkCheck size={14} />
                                Expertos en Estilo de Vida
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl mb-6 leading-tight">¿Dudas sobre un producto o costumbre?</h2>
                            <p className="text-emerald-100/60 text-base sm:text-lg font-light mb-8 max-w-xl">
                                STARK está entrenado para responder cualquier duda sobre compatibilidad Halal o protocolo social en España. No te quedes con la duda.
                            </p>
                            <button
                                onClick={() => sendMessage('¿Cómo puedo saber si un producto es Halal en España?')}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-400 transition-all shadow-lg active:scale-95 w-full sm:w-auto"
                            >
                                {t('halal_page.btn_ask')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
