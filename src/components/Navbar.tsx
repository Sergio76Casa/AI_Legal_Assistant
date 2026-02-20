import { LogOut, ShieldCheck, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

import { useTenant } from '../lib/TenantContext';

interface NavbarProps {
    className?: string;
    onNavigate?: (v: any) => void;
    user?: any;
    profile?: any;
    currentView?: string;
}

export function Navbar({ className, onNavigate, user, profile, currentView }: NavbarProps) {
    const { t } = useTranslation();
    const { tenant } = useTenant();

    const isSuperAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || t('nav.user_fallback');

    return (
        <nav className={cn("fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300", className)}>
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate?.(user ? 'dashboard' : 'home')}
                >
                    <div className="relative">
                        {tenant?.config?.show_logo && tenant?.config?.logo_url ? (
                            <img
                                src={tenant.config.logo_url}
                                alt={tenant.name}
                                className="h-10 w-auto group-hover:scale-105 transition-transform object-contain min-w-[40px]"
                            />
                        ) : (
                            <>
                                <img
                                    src="/logo.svg"
                                    alt="LegalFlow"
                                    className="w-10 h-10 group-hover:scale-105 transition-transform"
                                />
                                {tenant && (
                                    <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-white/10 shadow-sm">
                                        <Building2 size={10} className="text-primary" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex flex-col">
                        {!tenant?.config?.show_logo && (
                            <span className="font-serif text-lg font-bold tracking-tight text-white leading-none">
                                {tenant ? tenant.name : 'LegalFlow'}
                            </span>
                        )}
                        {tenant ? (
                            !tenant?.config?.show_logo && (
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full w-fit mt-0.5 border border-primary/20">
                                    {t('tenant_dashboard.admin_panel')}
                                </span>
                            )
                        ) : (
                            <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">{t('nav.brand_assistant')}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* Logged-in user flow */}
                    {user ? (
                        <div className="flex items-center gap-6">
                            {/* 1. Nombre del Logueado (Static) */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-slate-900 overflow-hidden border border-white/10">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-400">{username}</span>
                            </div>

                            {/* 2. Link Dinámico: Mis documentos / Mi dashboard */}
                            <button
                                onClick={() => onNavigate?.(['documents', 'templates', 'organization', 'affiliates', 'settings'].includes(currentView || '') ? 'dashboard' : 'documents')}
                                className="text-xs font-bold text-slate-400 hover:text-white transition-colors border-l border-white/10 pl-6 h-8 flex items-center gap-2"
                            >
                                <Building2 size={14} className="text-primary/50" />
                                {['documents', 'templates', 'organization', 'affiliates', 'settings'].includes(currentView || '') ? t('nav.my_dashboard') : (t('nav.documents') || 'Mis documentos')}
                            </button>

                            {/* 3. Logo para cambiar idioma */}
                            <div className="border-l border-white/10 pl-6 h-8 flex items-center">
                                <LanguageSelector />
                            </div>

                            {/* 4. Admin (if superadmin) & Logo para cerrar sesion */}
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => onNavigate?.('admin')}
                                        className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-slate-900 bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all uppercase shadow-sm shadow-primary/20"
                                    >
                                        <ShieldCheck size={12} />
                                        Admin
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        const supabase = (window as any).supabase;
                                        if (supabase) {
                                            supabase.auth.signOut().then(() => {
                                                // La redirección se maneja centralmente en App.tsx
                                            });
                                        }
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                    title={t('nav.logout')}
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <LanguageSelector />
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            <button
                                onClick={() => onNavigate?.('login')}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {t('nav.login')}
                            </button>
                            <button
                                onClick={() => onNavigate?.('contact')}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-slate-900 text-sm font-bold rounded-full shadow-lg shadow-primary/20 transition-all"
                            >
                                {t('nav.contact')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
