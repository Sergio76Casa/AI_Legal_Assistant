import { useState } from 'react';
import { LanguageSelector } from '../LanguageSelector';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
    onLogin: () => void;
    onCreateOrg: () => void;
}

export function Navbar({ onLogin, onCreateOrg }: NavbarProps) {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 glass-nav rounded-2xl md:rounded-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="text-primary flex items-center">
                    <span className="material-symbols-outlined text-2xl md:text-3xl font-bold">gavel</span>
                </div>
                <span className="text-lg md:text-xl font-bold tracking-tight text-white">LegalFlow</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
                <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#features">
                    {t('landing.features.title')}
                </a>
                <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#pricing">
                    {t('pricing.title')}
                </a>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden xs:block">
                    <LanguageSelector />
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={onLogin}
                        className="text-sm font-bold text-slate-300 hover:text-primary transition-colors"
                    >
                        {t('nav.login')}
                    </button>
                    <button
                        onClick={onCreateOrg}
                        className="bg-primary text-background-dark px-5 py-2 rounded-full text-sm font-bold tracking-wide hover:brightness-110 transition-all whitespace-nowrap"
                    >
                        {t('landing.nav.create_org')}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 mt-2 mx-0 p-6 glass-nav rounded-2xl md:hidden flex flex-col gap-6 border border-white/10 shadow-2xl"
                    >
                        <a
                            href="#features"
                            className="text-lg font-bold text-slate-200 hover:text-primary transition-colors flex items-center gap-3"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            {t('landing.features.title')}
                        </a>
                        <a
                            href="#pricing"
                            className="text-lg font-bold text-slate-200 hover:text-primary transition-colors flex items-center gap-3"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined text-primary">payments</span>
                            {t('pricing.title')}
                        </a>

                        <div className="h-px bg-white/10 w-full" />

                        <div className="xs:hidden">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('nav.language') || 'Idioma'}</p>
                            <LanguageSelector />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { onLogin(); setIsMenuOpen(false); }}
                                className="w-full py-4 text-center font-bold text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                            >
                                {t('nav.login')}
                            </button>
                            <button
                                onClick={() => { onCreateOrg(); setIsMenuOpen(false); }}
                                className="w-full py-4 text-center font-bold bg-primary text-background-dark rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                            >
                                {t('landing.nav.create_org')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

