import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { LogOut, ChevronLeft, ChevronRight, Globe, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface NavItem {
    id: string;
    label: string;
    icon: any;
    adminOnly?: boolean;
    category?: string;
}

interface SidebarProps {
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    user: any;
    profile: any;
    tenant: any;
    planMetadata: any;
    onClose?: () => void;
    isOpen?: boolean;
}

export function Sidebar({ navItems, activeTab, onTabChange, user, profile, tenant, planMetadata, onClose, isOpen }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t } = useTranslation();
    const isSuperAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';
    const isAdmin = isSuperAdmin || profile?.role === 'admin';
    const isSubUser = profile?.role === 'subuser';
    const isPublicUser = profile?.role === 'public_user';
    
    const visibleItems = navItems;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleLogoClick = () => {
        if (tenant?.slug) window.location.href = `/${tenant.slug}`;
        else window.location.href = '/';
    };

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || t('nav.user_fallback');

    return (
        <aside className={cn(
            "flex-shrink-0 bg-[#0a0f1d]/95 md:bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col h-full md:min-h-screen sticky md:top-0 transition-all duration-300 z-[100]",
            "fixed inset-y-0 left-0 md:relative transform md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            isCollapsed ? "w-20" : "w-72 md:w-64"
        )}>
            {/* Collapse Toggle (Desktop) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-3 top-8 bg-slate-800 border border-white/10 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-700 z-50 transition-colors shadow-lg"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Close Button (Mobile) */}
            <button
                onClick={onClose}
                className="md:hidden absolute right-4 top-8 p-2 text-slate-400 hover:text-white"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Header / Logo */}
            <div className={cn(
                "h-24 flex items-center border-b border-white/5 overflow-hidden",
                isCollapsed ? "px-0 justify-center" : "px-6"
            )}>
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={handleLogoClick}
                >
                    {tenant?.config?.show_navbar_logo !== false && tenant?.config?.logo_url ? (
                        <img
                            src={tenant.config.logo_url}
                            alt={tenant.name}
                            className={cn(
                                "h-10 w-auto group-hover:scale-105 transition-transform object-contain",
                                isCollapsed ? "min-w-[32px] max-w-[32px]" : "min-w-[40px]"
                            )}
                        />
                    ) : (
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className={cn(
                                "h-10 w-auto object-contain group-hover:scale-105 transition-transform",
                                isCollapsed && "hidden"
                            )}
                        />
                    )}
                    {isCollapsed && (!tenant?.config?.logo_url || tenant?.config?.show_navbar_logo === false) && (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                            L
                        </div>
                    )}
                </div>
            </div>

            {/* Web Pública Shortcut */}
            <div className={cn(
                "px-4 mb-2 mt-4",
                isCollapsed ? "px-2" : "px-4"
            )}>
                <button
                    onClick={() => {
                        if (tenant?.slug) window.location.href = `/${tenant.slug}`;
                        else window.location.href = '/';
                    }}
                    className={cn(
                        "w-full flex items-center justify-center gap-3 py-3 rounded-2xl transition-all duration-300",
                        "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 group",
                        isCollapsed ? "px-0" : "px-4"
                    )}
                >
                    <Globe size={18} className={cn("transition-transform", !isCollapsed && "group-hover:rotate-12")} />
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            <span>Ver Web Pública</span>
                            <ExternalLink size={10} className="opacity-50" />
                        </div>
                    )}
                </button>
            </div>

            <div className="h-px bg-white/5 mx-4 mb-2" />
            <div className={cn(
                "flex-1 overflow-y-auto py-6 space-y-8 no-scrollbar overflow-x-hidden",
                isCollapsed ? "px-2" : "px-4"
            )}>
                {[
                    "Espacio de Trabajo",
                    "Legal AI",
                    "Recursos",
                    "Gestión",
                    "Sistema",
                    "Otros"
                ].map((cat) => {
                    const items = visibleItems.filter(item => (item.category || "Otros") === cat);
                    if (items.length === 0) return null;

                    return (
                        <div key={cat} className="space-y-1">
                            {!isCollapsed && (
                                <h3 className="px-4 text-[10px] font-black tracking-widest text-slate-600 uppercase mb-3">
                                    {cat}
                                </h3>
                            )}
                            {isCollapsed && (
                                <div className="h-px bg-white/5 my-2 mx-2" />
                            )}
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center rounded-xl text-[13px] font-semibold transition-all relative overflow-hidden group mb-1",
                                        isCollapsed ? "px-0 justify-center py-3" : "px-4 py-2.5 gap-3",
                                        activeTab === item.id
                                            ? "text-primary shadow-[inset_0_0_12px_rgba(19,236,200,0.05)] bg-[#101b2a]"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon size={18} className={cn(
                                        "transition-transform duration-300",
                                        activeTab === item.id ? "scale-110" : "group-hover:scale-110 text-slate-500",
                                        isCollapsed && "mx-auto"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                    {activeTab === item.id && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary shadow-[0_0_8px_rgba(19,236,200,0.5)] rounded-r-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Footer / User Identity */}
            <div className={cn(
                "p-4 border-t border-white/5 bg-black/20 flex flex-col items-center",
                isCollapsed ? "px-2 pb-6 pt-4" : "p-6"
            )}>
                {!isCollapsed ? (
                    <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-2">
                            {/* Role Badge */}
                            <div className={cn(
                                "px-2 py-[2px] rounded text-[9px] font-bold tracking-wider uppercase border whitespace-nowrap",
                                isSuperAdmin ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                isAdmin ? "bg-primary/10 text-primary border-primary/20" :
                                isSubUser ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                isPublicUser ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}>
                                {isSuperAdmin ? 'Superadmin' : 
                                 isAdmin ? 'Admin' : 
                                 isSubUser ? 'User' : 
                                 isPublicUser ? 'Public' : 'Tenant'}
                            </div>

                            {/* Plan Badge */}
                            {!isSuperAdmin && (
                                <div className={cn(
                                    "px-2 py-[2px] rounded text-[9px] font-bold tracking-wider uppercase border whitespace-nowrap",
                                    planMetadata.badgeStyle
                                )}>
                                    {planMetadata.commercialName}
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-2 text-sm font-semibold text-white truncate">
                            {username}
                        </div>
                        <div className="text-xs text-slate-400 truncate pb-2 border-b border-white/5">
                            {user?.email}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors mt-2"
                    >
                        <LogOut size={14} />
                        <span>Cerrar Sesión</span>
                    </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </aside>
    );
}
