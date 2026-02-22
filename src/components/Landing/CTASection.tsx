import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

interface CTASectionProps {
    onCreateOrg: (planId?: string) => void;
    onBookDemo?: () => void;
}

export function CTASection({ onCreateOrg, onBookDemo }: CTASectionProps) {
    const { t } = useTranslation();

    return (
        <section className="py-24 px-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto glass-card rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden backdrop-blur-2xl"
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src="/bg-cta.png" alt="" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/60 to-background-dark/40"></div>
                </div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>

                <div className="relative z-10 space-y-8">
                    <h2 className="font-serif text-4xl md:text-6xl text-white max-w-3xl mx-auto leading-tight">
                        <Trans i18nKey="landing.cta.title">
                            Digitaliza tu despacho con <span className="text-primary">IA de extranjería</span>
                        </Trans>
                    </h2>

                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                        {t('landing.cta.desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => onCreateOrg('pro')}
                            className="w-full sm:w-auto bg-primary text-background-dark px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40"
                        >
                            {t('landing.cta.btn')}
                        </button>
                        <button
                            onClick={onBookDemo}
                            className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-bold border border-white/10 hover:bg-white/5 transition-all text-white"
                        >
                            {t('landing.cta.btn_demo')}
                        </button>
                    </div>

                    <p className="text-sm text-slate-500">
                        {t('landing.cta.footer')}
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
