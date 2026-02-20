import React from 'react';
import { Navbar } from './Navbar';
import { useTranslation } from 'react-i18next';

export function Layout({ children, onNavigate, user, profile, hideNavFooter = false, hideFooter = false, currentView }: {
    children: React.ReactNode,
    onNavigate?: (v: any) => void,
    user?: any,
    profile?: any,
    hideNavFooter?: boolean,
    hideFooter?: boolean,
    currentView?: string
}) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0f1d] font-sans text-slate-100 antialiased">
            {!hideNavFooter && <Navbar onNavigate={onNavigate} user={user} profile={profile} currentView={currentView} />}
            <main className={`flex-grow ${hideNavFooter ? '' : 'pt-20'} page-enter`}>
                {children}
            </main>
            {!hideNavFooter && !hideFooter && (
                <footer className="py-12 border-t border-white/5 bg-[#0a0f1d]">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} LegalFlow. {t('nav.contact')}.
                        </p>
                        <div className="flex justify-center gap-6 mt-4">
                            <button
                                onClick={() => onNavigate?.('privacy')}
                                className="text-xs text-slate-500 hover:text-primary transition-colors"
                            >
                                {t('legal.footer_privacy')}
                            </button>
                            <button
                                onClick={() => onNavigate?.('cookies')}
                                className="text-xs text-slate-500 hover:text-primary transition-colors"
                            >
                                {t('legal.footer_cookies')}
                            </button>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <a
                                href="https://legalflow.digital"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate?.('home');
                                    window.location.href = 'https://legalflow.digital';
                                }}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full transition-colors border border-primary/20"
                            >
                                ⚡ Powered by LegalFlow Platform
                            </a>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
