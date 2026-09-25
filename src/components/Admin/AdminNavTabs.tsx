import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NavItem {
    id: string;
    icon: LucideIcon;
    label: string;
    category?: string;
    adminOnly?: boolean;
}

interface AdminNavTabsProps {
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    isSidebarStyle: boolean;
    isSyncing: boolean;
    syncStatus: { type: 'success' | 'error'; message: string } | null;
    onSync: () => void;
}

export const AdminNavTabs: React.FC<AdminNavTabsProps> = ({
    navItems,
    activeTab,
    onTabChange,
    isSidebarStyle,
    isSyncing,
    syncStatus,
    onSync
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {!isSidebarStyle ? (
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] w-full lg:w-fit overflow-hidden shadow-2xl">
                    {navItems.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-[11px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap overflow-hidden group",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            ) : <div />}

            <div className="flex justify-end">
                <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 group bg-slate-900/30 backdrop-blur-sm disabled:opacity-50"
                    title="Sincronizar datos"
                >
                    <RefreshCw size={20} className={cn("transition-transform duration-700", isSyncing ? "animate-spin text-primary" : "group-hover:rotate-180")} />
                    <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </span>
                </button>
            </div>

            {syncStatus && (
                <div className="flex justify-end mt-2 animate-in slide-in-from-right fade-in w-full">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        syncStatus.type === 'success' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                    )}>
                        {syncStatus.message}
                    </span>
                </div>
            )}
        </div>
    );
};
