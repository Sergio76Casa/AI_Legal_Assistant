import React from 'react';
import { Navbar } from './Navbar';
import { useTranslation } from 'react-i18next';

export function Layout({ children, onNavigate, user, profile }: {
    children: React.ReactNode,
    onNavigate?: (v: any) => void,
    user?: any,
    profile?: any
}) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <Navbar onNavigate={onNavigate} user={user} profile={profile} />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <footer className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Legal & Halal Assistant. {t('nav.contact')}.
                    </p>
                    <div className="flex justify-center gap-6 mt-4">
                        <button
                            onClick={() => onNavigate?.('privacy')}
                            className="text-xs text-gray-400 hover:text-primary transition-colors"
                        >
                            {t('legal.footer_privacy')}
                        </button>
                        <button
                            onClick={() => onNavigate?.('cookies')}
                            className="text-xs text-gray-400 hover:text-primary transition-colors"
                        >
                            {t('legal.footer_cookies')}
                        </button>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-50">
                        <a
                            href="/"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate?.('home');
                                // Si 'home' no lleva a landing cuando hay usuario, 
                                // quizás necesitemos una lógica de "Cerrar sesión" o un link externo real si la landing es otra URL.
                                // Asumiendo que '/' es la landing pública y el router lo maneja.
                                // Si estamos dentro de la app (autenticados), ir a '/' podría llevar al dashboard.
                                // El usuario pidió "acceder a la landing", si ya están dentro, la landing suele ser para no-autenticados.
                                // Pero bueno, pondremos el link visualmente.
                                window.location.href = '/';
                            }}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                            ⚡ Powered by Legal & Halal Enterprise Platform
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
