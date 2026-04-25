import { LogOut, ShieldCheck, Building2, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import { useAppSettings } from '../lib/AppSettingsContext';
import { getPlanMetadata } from '../lib/constants/plans';

interface NavbarProps {
    className?: string;
    onNavigate?: (view: any, path?: string) => void;
    user?: any;
    profile?: any;
    currentView?: string;
}

export function Navbar({ className, user, profile, currentView: _cv }: NavbarProps) {
    const { t } = useTranslation();
    const { tenant } = useTenant();
    const { settings } = useAppSettings();
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;
    const isSuperAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';
    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || t('nav.user_fallback');
    const basePlan = profile?.subscription_tier || tenant?.plan || 'free';
    const displayPlan = getPlanMetadata(basePlan, settings?.plan_names).commercialName;

    const handleLogoClick = () => {
        if (tenant?.slug) navigate(`/${tenant.slug}`);
        else navigate('/');
    };

    // If using sidebar navigation, hide top nav in dashboard views
    if (settings?.navigation_style === 'sidebar' && currentPath.startsWith('/dashboard')) {
        return null;
    }

    return (
        <nav className={cn("fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300", className)}>
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo and Badges Container */}
                <div className="relative flex flex-col justify-center">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={handleLogoClick}
                    >
                        <div className="relative">
                            {tenant?.config?.show_navbar_logo !== false && tenant?.config?.logo_url ? (
                                <img
                                    src={tenant.config.logo_url}
                                    alt={tenant.name}
                                    className="h-14 w-auto group-hover:scale-105 transition-transform object-contain min-w-[60px]"
                                />
                            ) : (
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                                />
                            )}
                            {tenant && (
                                <div className="absolute -bottom-1 -right-1 bg-slate-900/80 backdrop-blur-md rounded-full p-1 border border-primary/30 shadow-[0_0_10px_rgba(19,236,200,0.2)] group-hover:scale-110 transition-transform">
                                    <Building2 size={10} className="text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* Logged-in user flow */}
                    {user ? (
                        <div className="flex items-center gap-3 md:gap-6">
                            {/* 1. Nombre y Avatar del Logueado */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-slate-900 overflow-hidden border border-white/10">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    {profile?.role === 'admin' && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-[8px] font-black text-slate-900 px-1 rounded-full border border-slate-900 shadow-sm" title="Administrador de Organización">
                                            ADM
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-300">{username}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {user?.email && (
                                            <span className="text-[10px] text-slate-500 font-medium leading-none">{user.email}</span>
                                        )}
                                    </div>
                                </div>
                            </div>



                            {/* 2.5 Link a Web Pública */}
                            <button
                                onClick={handleLogoClick}
                                className="group flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-all relative"
                                title="Ir a web pública"
                            >
                                <Globe size={18} className="text-slate-500 group-hover:text-primary transition-colors" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-4 transition-all" />
                            </button>

                            <div className="w-[1px] h-4 bg-white/10 mx-2" />

                            {/* 3. Logo para cambiar idioma */}
                            <div className="px-2">
                                <LanguageSelector />
                            </div>

                            <div className="w-[1px] h-4 bg-white/10 mx-2" />

                            {/* 4. Admin (if superadmin) & Logo para cerrar sesion */}
                            <div className="flex items-center gap-4 pl-2">
                                {isSuperAdmin && (
                                    <div className="flex flex-col items-end gap-1.5 pt-1">
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="group flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-900 bg-gradient-to-r from-primary to-emerald-400 px-4 py-1.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(19,236,200,0.4)] transition-all uppercase"
                                        >
                                            <ShieldCheck size={12} className="group-hover:rotate-12 transition-transform" />
                                            {profile?.role === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}
                                        </button>
                                        
                                        {/* PLAN Badge moved here */}
                                        <div className={cn(
                                            "px-2 py-0.5 rounded-full border text-[7px] font-bold uppercase tracking-[0.2em] leading-none backdrop-blur-md",
                                            (basePlan === 'business') 
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]" 
                                                : "bg-white/5 border-white/10 text-white/40"
                                        )}>
                                            {displayPlan}
                                        </div>
                                    </div>
                                )}
                                 <button
                                    onClick={async () => {
                                        const slug = tenant?.slug;
                                        console.log(`[Navbar] Logging out. Target redirect: ${slug ? `/${slug}` : '/'}`);
                                        
                                        try {
                                            await supabase.auth.signOut();
                                        } catch (err) {
                                            console.error('SignOut error:', err);
                                        }
                                        
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        
                                        // Redirect to tenant slug or root
                                        const redirectPath = slug ? `/${slug}` : '/';
                                        window.location.href = `${redirectPath}?logout=true`;
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                                    title={t('nav.logout')}
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="hidden md:block">
                                <LanguageSelector />
                            </div>
                            <div className="hidden md:block h-4 w-px bg-white/10 mx-2" />
                            <button
                                onClick={() => navigate('/login')}
                                className="px-3 md:px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {t('nav.login')}
                            </button>
                            {(currentPath === '/' || isSuperAdmin) && (
                                <button
                                    onClick={() => navigate('/create-org')}
                                    className="px-4 md:px-6 py-2 bg-primary hover:bg-primary/90 text-slate-900 text-sm font-bold rounded-full shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                                >
                                    {t('nav.contact', { defaultValue: 'Crear Organización' })}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
}

