import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader2, CheckCircle2, AlertCircle, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAppSettings } from '../../lib/AppSettingsContext';
import { supabase } from '../../lib/supabase';

export const InterfaceSection: React.FC = () => {
    const { settings, refreshSettings } = useAppSettings();
    const [navigationStyle, setNavigationStyle] = useState<'topnav' | 'sidebar'>('topnav');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (settings?.navigation_style) {
            setNavigationStyle(settings.navigation_style);
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        setStatus(null);

        try {
            // First, fetch current settings to avoid overwriting other fields
            const { data, error: fetchError } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'global')
                .single();

            if (fetchError) throw fetchError;

            const updatedSettings = {
                ...(data.settings as any),
                navigation_style: navigationStyle
            };

            const { error: updateError } = await supabase
                .from('app_settings')
                .update({ settings: updatedSettings })
                .eq('id', 'global');

            if (updateError) throw updateError;

            await refreshSettings();
            setStatus({ type: 'success', message: 'Interfaz actualizada' });
            setTimeout(() => setStatus(null), 3000);
        } catch (error: any) {
            console.error('Error saving UI style:', error);
            setStatus({ type: 'error', message: 'Error al guardar' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 md:p-10 space-y-8">
            <div className="max-w-2xl space-y-8">
                <div className="space-y-6">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estilo de Navegación Principal</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setNavigationStyle('topnav')}
                            className={cn(
                                "group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-500 gap-5 overflow-hidden",
                                navigationStyle === 'topnav'
                                    ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)]"
                                    : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.04]"
                            )}
                        >
                            {navigationStyle === 'topnav' && (
                                <motion.div 
                                    layoutId="active-bg"
                                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
                                />
                            )}
                            
                            <div className={cn(
                                "w-full h-16 rounded-xl flex flex-col pt-3 items-center gap-1.5 transition-all duration-500 border",
                                navigationStyle === 'topnav' ? "bg-black/40 border-primary/20" : "bg-black/20 border-white/5 opacity-40 group-hover:opacity-60"
                            )}>
                                <div className={cn("w-10 h-1.5 rounded-full transition-colors", navigationStyle === 'topnav' ? "bg-primary" : "bg-white/20")} />
                                <div className="w-5 h-1.5 bg-white/10 rounded-full" />
                            </div>
                            
                            <div className="text-center relative z-10">
                                <span className={cn(
                                    "font-black uppercase tracking-widest text-[10px] transition-colors",
                                    navigationStyle === 'topnav' ? "text-primary" : "text-slate-400"
                                )}>Clásica (Superior)</span>
                                <p className="text-[9px] text-slate-500 font-medium mt-1">Panel horizontal fijo</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setNavigationStyle('sidebar')}
                            className={cn(
                                "group relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-500 gap-5 overflow-hidden",
                                navigationStyle === 'sidebar'
                                    ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)]"
                                    : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.04]"
                            )}
                        >
                            {navigationStyle === 'sidebar' && (
                                <motion.div 
                                    layoutId="active-bg"
                                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
                                />
                            )}

                            <div className={cn(
                                "w-full h-16 rounded-xl flex px-3 items-center gap-2.5 transition-all duration-500 border",
                                navigationStyle === 'sidebar' ? "bg-black/40 border-primary/20" : "bg-black/20 border-white/5 opacity-40 group-hover:opacity-60"
                            )}>
                                <div className={cn("w-2.5 h-10 rounded-full transition-colors flex-shrink-0", navigationStyle === 'sidebar' ? "bg-primary" : "bg-white/20")} />
                                <div className="flex-1 space-y-1.5">
                                    <div className="w-full h-1.5 bg-white/10 rounded-full" />
                                    <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
                                </div>
                            </div>

                            <div className="text-center relative z-10">
                                <span className={cn(
                                    "font-black uppercase tracking-widest text-[10px] transition-colors",
                                    navigationStyle === 'sidebar' ? "text-primary" : "text-slate-400"
                                )}>Lateral (Sidebar)</span>
                                <p className="text-[9px] text-slate-500 font-medium mt-1">Panel vertical persistente</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10">
                    <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        <strong className="text-primary uppercase tracking-tighter mr-1">Nota del Sistema:</strong> 
                        Este cambio es global y afectará a todos los administradores del ecosistema. 
                        La vista lateral proporciona una navegación más estructurada para flujos de trabajo intensivos.
                    </p>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || navigationStyle === settings?.navigation_style}
                        className={cn(
                            "px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-3",
                            isSaving || navigationStyle === settings?.navigation_style
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-white text-slate-900 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                        )}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Layout size={16} />}
                        <span>{isSaving ? 'Actualizando...' : 'Aplicar Estilo'}</span>
                    </button>

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                    status.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                )}
                            >
                                {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {status.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
