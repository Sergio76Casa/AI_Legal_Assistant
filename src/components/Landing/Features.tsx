import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureDetail {
    id: string;
    title: string;
    description: string;
    icon: string;
    expanded: string;
    image: string;
}

export function Features() {
    const { t } = useTranslation();
    const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(null);

    const features: FeatureDetail[] = [
        {
            id: 'security',
            title: t('landing.features.security_title'),
            description: t('landing.features.security_desc'),
            icon: 'shield_person',
            expanded: t('landing.features.security_expanded'),
            image: "/images/feature-security.png"
        },
        {
            id: 'ai',
            title: t('landing.features.ai_title'),
            description: t('landing.features.ai_desc'),
            icon: 'psychology',
            expanded: t('landing.features.ai_expanded'),
            image: "/images/feature-ai.png"
        },
        {
            id: 'global',
            title: t('landing.features.global_title'),
            description: t('landing.features.global_desc'),
            icon: 'travel_explore',
            expanded: t('landing.features.global_expanded'),
            image: "/images/feature-global.png"
        }
    ];

    return (
        <section id="features" className="py-24 px-4 max-w-6xl mx-auto relative">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
                    {t('landing.features.title')}
                </h2>
                <h3 className="font-serif text-4xl md:text-5xl text-white">
                    {t('landing.features.subtitle')}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Security Card - Large */}
                <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedFeature(features[0])}
                    className="md:col-span-8 glass-card p-6 md:p-10 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[350px] md:h-[400px] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <img src={features[0].image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 md:mb-8 border border-primary/20">
                            <span className="material-symbols-outlined text-2xl md:text-3xl">{features[0].icon}</span>
                        </div>
                        <h4 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{features[0].title}</h4>
                        <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                            {features[0].description}
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-primary font-bold text-sm">
                        {t('landing.features.tech_details')} <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">trending_flat</span>
                    </div>
                </motion.div>

                {/* AI Card - Vertical */}
                <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedFeature(features[1])}
                    className="md:col-span-4 glass-card p-6 md:p-10 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[300px]"
                >
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity">
                        <img src={features[1].image} className="w-full h-full object-cover shadow-2xl" alt="" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <span className="material-symbols-outlined text-3xl">{features[1].icon}</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{features[1].title}</h4>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {features[1].description}
                        </p>
                    </div>
                </motion.div>

                {/* Global Card - Wide */}
                <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedFeature(features[2])}
                    className="md:col-span-8 glass-card p-6 md:p-10 rounded-3xl cursor-pointer group relative overflow-hidden min-h-[300px] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <img src={features[2].image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <span className="material-symbols-outlined text-3xl">{features[2].icon}</span>
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{features[2].title}</h4>
                        <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                            {features[2].description}
                        </p>
                    </div>
                    <div className="relative z-10 h-1.5 bg-white/5 rounded-full overflow-hidden w-full max-w-xs">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '85%' }}
                            className="h-full bg-primary"
                        ></motion.div>
                    </div>
                </motion.div>

                {/* Stats Card */}
                <div className="md:col-span-4 glass-card p-6 md:p-10 rounded-3xl flex flex-col justify-center border-primary/10 bg-primary/5">
                    <div className="space-y-2">
                        <p className="text-primary text-6xl font-black italic tracking-tighter animate-pulse">24h</p>
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{t('landing.features.response_time')}</p>
                        <p className="text-xs text-emerald-400 font-medium mt-4 flex items-center gap-1 bg-emerald-400/10 w-fit px-2 py-1 rounded">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            {t('landing.features.speed_advantage')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedFeature && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeature(null)}
                            className="fixed inset-0 bg-background-dark/80 backdrop-blur-md z-[100] cursor-pointer"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl bg-slate-900/95 backdrop-blur-2xl rounded-3xl z-[101] overflow-hidden border border-white/10 shadow-2xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="h-64 md:h-full relative overflow-hidden">
                                    <img src={selectedFeature.image} className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2s]" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent md:hidden"></div>
                                </div>
                                <div className="p-8 md:p-12 space-y-6 relative">
                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all hover:bg-white/10"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <span className="material-symbols-outlined text-3xl">{selectedFeature.icon}</span>
                                    </div>

                                    <div>
                                        <h4 className="text-3xl font-bold text-white mb-2">{selectedFeature.title}</h4>
                                        <p className="text-primary text-sm font-bold tracking-widest uppercase">{t('landing.features.tech_features')}</p>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed text-lg italic">
                                        "{selectedFeature.expanded}"
                                    </p>

                                    <div className="pt-6 border-t border-white/5">
                                        <button
                                            onClick={() => window.location.href = '#about'}
                                            className="w-full bg-primary text-slate-900 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            {t('landing.features.request_whitepaper')}
                                            <span className="material-symbols-outlined text-lg">description</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
