import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

interface ProceduresHeroProps {
    onBack: () => void;
}

export const ProceduresHero: React.FC<ProceduresHeroProps> = ({ onBack }) => {
    const { t } = useTranslation();
    return (
        <>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-12"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{t('procedures_page.back')}</span>
            </button>

            <div className="max-w-3xl mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
                        <Trans i18nKey="procedures_page.title">
                            Guía Integral de <span className="text-primary italic">Trámites Legales</span>
                        </Trans>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed">
                        {t('procedures_page.desc')}
                    </p>
                </motion.div>
            </div>
        </>
    );
};
