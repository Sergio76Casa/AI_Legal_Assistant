import { LanguageSelector } from '../LanguageSelector';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    onLogin: () => void;
    onCreateOrg: () => void;
}

export function Navbar({ onLogin, onCreateOrg }: NavbarProps) {
    const { t } = useTranslation();

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 glass-nav rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="text-primary flex items-center">
                    <span className="material-symbols-outlined text-3xl font-bold">gavel</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">LegalFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#features">
                    {t('landing.features.title')}
                </a>
                <a className="text-sm font-medium text-slate-300 hover:text-primary transition-colors" href="#pricing">
                    {t('pricing.title')}
                </a>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <LanguageSelector />
                <button
                    onClick={onLogin}
                    className="hidden sm:block text-sm font-bold text-slate-300 hover:text-primary transition-colors"
                >
                    {t('landing.nav.login')}
                </button>
                <button
                    onClick={onCreateOrg}
                    className="bg-primary text-background-dark px-4 md:px-5 py-2 rounded-full text-sm font-bold tracking-wide hover:brightness-110 transition-all whitespace-nowrap"
                >
                    {t('landing.nav.create_org')}
                </button>
            </div>
        </nav>
    );
}
