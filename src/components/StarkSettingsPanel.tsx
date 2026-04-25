import React, { useState } from 'react';
import { Settings, Loader2, CheckCircle2, ChevronDown, Sparkles, Cpu } from 'lucide-react';
import { ViewHeader } from './Admin/ViewHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';


// Hooks
import { useTenantConfig } from '../hooks/useTenantConfig';
import { useConfigTranslations } from '../hooks/useConfigTranslations';
import { useAssetUpload } from '../hooks/useAssetUpload';

// Components
import { IdentitySection } from './Config/IdentitySection';
import { ContactSection } from './Config/ContactSection';
import { FooterSection } from './Config/FooterSection';
import { PlansSection } from './Config/PlansSection';
import { InterfaceSection } from './Config/InterfaceSection';

interface StarkSettingsPanelProps {
    tenant: any;
    refreshTenant: () => Promise<void>;
}

export const StarkSettingsPanel: React.FC<StarkSettingsPanelProps> = ({ tenant, refreshTenant }) => {
    
    // Logic Hooks
    const { handleTranslate, translating, translationSuccess, translationProgress } = useConfigTranslations();
    const { uploadingField, handleFileUpload } = useAssetUpload(tenant?.id);
    const {
        identity, setIdentity,
        contact, setContact,
        footerLinks, setFooterLinks,
        saving, status, updatingPlan,
        handleSave, handleUpdatePlan
    } = useTenantConfig(tenant, refreshTenant, handleTranslate);

    // UI State
    const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
        identity: true,
        footer: false,
        contact: false,
        plans: false,
        interface: false
    });

    const toggleBlock = (block: string) => {
        setExpandedBlocks(prev => ({
            ...prev,
            [block]: !prev[block]
        }));
    };

    const sections = [
        { id: 'identity', title: 'Identidad Visual', subtitle: 'Logos, nombre comercial y estilos', icon: Sparkles, Component: IdentitySection, props: { identity, setIdentity, uploadingField, handleFileUpload } },
        { id: 'footer', title: 'Información Interactiva', subtitle: 'Gestión de enlaces y traducciones IA', icon: Settings, Component: FooterSection, props: { footerLinks, setFooterLinks, translating, translationSuccess, translationProgress } },
        { id: 'contact', title: 'Información de Contacto', subtitle: 'Direcciones, redes y atención al cliente', icon: Settings, Component: ContactSection, props: { contact, setContact } },
        { id: 'plans', title: 'Plan & Suscripción', subtitle: 'Gestión de planes B2B y facturación', icon: Settings, Component: PlansSection, props: { currentPlan: tenant?.plan || 'free', updatingPlan, onUpdatePlan: handleUpdatePlan } },
        { id: 'interface', title: 'Ajustes de Interfaz', subtitle: 'Estilo de navegación y visualización', icon: Settings, Component: InterfaceSection, props: {} },
    ];

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Cpu} 
                title="Configuración Stark" 
                subtitle="Parámetros del motor de IA y personalización de marca"
                badge="IA Engine v2.0"
                badgeColor="primary"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 space-y-10">
                <div className="flex justify-end items-center gap-4 mb-4">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-emerald-400 text-xs font-black uppercase tracking-widest px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            >
                                <CheckCircle2 size={14} /> Sincronizado
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

            {/* Secciones Dinámicas */}
            <div className="space-y-6 relative z-10">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        className={cn(
                            "group bg-[#0A0F1D]/40 backdrop-blur-2xl border rounded-[32px] transition-all duration-500 overflow-hidden",
                            expandedBlocks[section.id] 
                                ? "border-primary/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]" 
                                : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                        )}
                    >
                        <div
                            className="p-8 cursor-pointer flex items-center justify-between group/header"
                            onClick={() => toggleBlock(section.id)}
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border",
                                    expandedBlocks[section.id] 
                                        ? "bg-primary/20 text-primary border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]" 
                                        : "bg-white/5 text-slate-500 border-white/5 group-hover/header:border-white/20 group-hover/header:text-white"
                                )}>
                                    <section.icon size={20} className="transition-transform group-hover/header:rotate-12" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">{section.title}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">{section.subtitle}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                expandedBlocks[section.id] ? "bg-primary/10 text-primary rotate-180" : "bg-white/5 text-slate-500 group-hover/header:bg-white/10"
                            )}>
                                <ChevronDown size={18} />
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedBlocks[section.id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                >
                                    <section.Component {...(section.props as any)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-12">
                <button
                    onClick={() => handleSave()}
                    disabled={saving || translating}
                    className={cn(
                        "px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.3)] active:scale-95 disabled:opacity-50 group border border-primary/20",
                        saving || translating
                            ? "bg-slate-800 text-slate-500"
                            : "bg-primary text-slate-900 hover:scale-[1.05] hover:shadow-primary/40"
                    )}
                >
                    {saving || translating ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                    )}
                    <span>{saving ? 'Sincronizando...' : translating ? 'IA Stark...' : 'Guardar Cambios'}</span>
                </button>
            </div>
            </div>
        </div>
    );
};
