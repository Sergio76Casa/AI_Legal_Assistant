import { LogOut, ShieldCheck, Building2, Crown, FileText, Grid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

import { useTenant } from '../lib/TenantContext';

interface NavbarProps {
    className?: string;
    onNavigate?: (v: any) => void;
    user?: any;
    profile?: any;
}

export function Navbar({ className, onNavigate, user, profile }: NavbarProps) {
    const { t } = useTranslation();
    const { tenant } = useTenant();

    // Superadmin check (hardcoded email + DB role)
    const isSuperAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';

    // Tenant Admin check: Check metadata or profile role
    // Using a very explicit check here
    const isTenantAdmin = user?.user_metadata?.role === 'admin' || profile?.role === 'admin' || isSuperAdmin;
    const isTenantUser = !!user;

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || t('nav.user_fallback');

    return (
        <nav className={cn("fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300", className)}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logotipo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate?.('home')}
                >
                    <div className="relative">
                        <img
                            src="/logo.svg"
                            alt="Legal & Halal"
                            className="w-10 h-10 group-hover:scale-105 transition-transform"
                        />
                        {tenant && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-100 shadow-sm">
                                <Building2 size={10} className="text-emerald-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-lg font-bold tracking-tight text-gray-900 leading-none">
                            Legal & Halal
                        </span>
                        {tenant ? (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full w-fit mt-0.5 border border-emerald-100/50">
                                {tenant.name}
                            </span>
                        ) : (
                            <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{t('nav.brand_assistant')}</span>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-4">
                    {/* Link Plantillas (Admin) - Moved FIRST and removed HIDDEN */}
                    {isTenantAdmin && (
                        <button
                            onClick={() => onNavigate?.('templates')}
                            className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors px-3 py-2 rounded-lg shadow-sm"
                            title={t('nav.manage_templates')}
                        >
                            <Grid size={18} />
                            {t('nav.pdf_templates')}
                        </button>
                    )}

                    {/* Link Documentos */}
                    {isTenantUser && (
                        <button
                            onClick={() => onNavigate?.('documents')}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-lg border border-slate-100/50"
                        >
                            <FileText size={18} />
                            {t('nav.documents')}
                        </button>
                    )}

                    {/* Selector de idioma */}
                    <LanguageSelector />

                    {/* Usuario logueado */}
                    {user && (
                        <>
                            {/* Info Usuario + Tenant Badge */}
                            <div className="hidden sm:flex items-center gap-3 px-1 py-1 pr-4 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col -gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-700">{username}</span>
                                        {isTenantAdmin && (
                                            <button
                                                onClick={() => onNavigate?.('tenant-settings')}
                                                className="flex items-center gap-0.5 text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                                                title={t('nav.manage_org')}
                                            >
                                                <Crown size={8} className="text-amber-500 fill-amber-500" />
                                                {t('nav.admin_badge')}
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                                        {user.email}
                                    </span>
                                </div>
                            </div>

                            {/* Menu Actions */}
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                                {/* Superadmin Badge/Button */}
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => onNavigate?.('admin')}
                                        className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <ShieldCheck size={12} />
                                        {t('nav.superadmin_dashboard')}
                                    </button>
                                )}

                                {/* Cerrar sesión */}
                                <button
                                    onClick={() => {
                                        const supabase = (window as any).supabase;
                                        if (supabase) {
                                            supabase.auth.signOut().then(() => {
                                                onNavigate?.('home');
                                            });
                                        }
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    title={t('nav.logout')}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Usuario no logueado */}
                    {!user && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onNavigate?.('login')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                {t('nav.login')}
                            </button>
                            <button
                                onClick={() => onNavigate?.('contact')} // Assuming contact view exists or handled globally
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                {t('nav.contact')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
}
