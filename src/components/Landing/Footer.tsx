import { useTranslation } from 'react-i18next';

interface FooterProps {
    onBookDemo?: () => void;
    onOpenLegal?: (type: 'privacy' | 'cookies') => void;
}

export function Footer({ onBookDemo, onOpenLegal }: FooterProps) {
    const { t } = useTranslation();

    return (
        <footer className="py-12 px-4 border-t border-white/5 bg-background-dark">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
                    <span className="font-bold text-white text-xl">LegalFlow</span>
                </div>

                <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                    <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => onOpenLegal?.('privacy')}>
                        {t('legal.privacy_title')}
                    </button>
                    <button className="hover:text-primary transition-colors cursor-pointer" onClick={() => onOpenLegal?.('cookies')}>
                        {t('legal.cookies_title')}
                    </button>
                    <button className="hover:text-primary transition-colors cursor-pointer" onClick={onBookDemo}>
                        {t('nav.contact')}
                    </button>
                </div>

                <p className="text-sm text-slate-500">
                    © 2026 LegalFlow. {t('landing.footer')}
                </p>
            </div>
        </footer>
    );
}
