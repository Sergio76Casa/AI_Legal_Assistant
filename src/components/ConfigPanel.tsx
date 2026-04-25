import React, { useState } from 'react';
import { Sparkles, Building2, Lock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTenant } from '../lib/TenantContext';

// Components
import { BusinessSettingsPanel } from './BusinessSettingsPanel';
import { StarkSettingsPanel } from './StarkSettingsPanel';
import { ViewHeader } from './Admin/ViewHeader';
import { Settings2 } from 'lucide-react';

interface ConfigPanelProps {
    tenant: any;
    refreshTenant: () => Promise<void>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ tenant, refreshTenant }) => {
    const { profile } = useTenant();
    const isSuperAdmin = profile?.role === 'superadmin';
    const isAdmin = profile?.role === 'admin';
    
    // Default tab based on role
    const [activeTab, setActiveTab] = useState<'business' | 'stark'>(
        isSuperAdmin ? 'business' : 'stark'
    );

    // Security Check: If Admin tries to access Business Settings
    const canAccessBusiness = isSuperAdmin;

    if (activeTab === 'business' && !canAccessBusiness) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <ShieldAlert size={40} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white">Acceso Denegado</h2>
                    <p className="text-slate-400 mt-2 max-w-sm">
                        No tienes los permisos necesarios para modificar la infraestructura de negocio. Esta sección es exclusiva para Superadministradores.
                    </p>
                </div>
                <button
                    onClick={() => setActiveTab('stark')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    Volver a Stark 2.0
                </button>
            </div>
        );
    }

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Settings2} 
                title="Configuración Sistema" 
                subtitle={activeTab === 'business' ? "Gestión de Planes y Estrategia B2B" : "Personalización de la Experiencia Stark"}
                badge={activeTab === 'business' ? "Infraestructura" : "Frontend & UI"}
                badgeColor={activeTab === 'business' ? "blue" : "emerald"}
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 relative space-y-10">
            {/* Background Atmosphere */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Tabs Orchestrator */}
            {isSuperAdmin && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl w-fit relative z-20">
                    <button
                        onClick={() => setActiveTab('business')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'business'
                                ? "bg-primary text-slate-900 shadow-lg shadow-primary/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Building2 size={16} />
                        Negocio
                    </button>
                    <button
                        onClick={() => setActiveTab('stark')}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'stark'
                                ? "bg-primary text-slate-900 shadow-lg shadow-primary/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Sparkles size={16} />
                        Stark 2.0
                    </button>
                </div>
            )}

            {/* Display Header if Admin (who can't see the tab buttons) */}
            {isAdmin && !isSuperAdmin && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[.3em] text-[10px] mb-4"
                >
                    <Lock size={12} className="text-primary/50" /> Portal de Gestión Administrador
                </motion.div>
            )}

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10"
            >
                {activeTab === 'business' && <BusinessSettingsPanel />}
                {activeTab === 'stark' && <StarkSettingsPanel tenant={tenant} refreshTenant={refreshTenant} />}
            </motion.div>

            {/* Global Atmosphere Elements */}
            <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    );
};
