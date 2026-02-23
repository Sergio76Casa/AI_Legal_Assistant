import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppSettings } from '../lib/AppSettingsContext';
import { Save, Settings2, ShieldCheck, Percent, HelpCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const BusinessSettingsPanel: React.FC = () => {
    const { settings, refreshSettings } = useAppSettings();
    const [formData, setFormData] = useState({
        free_name: '',
        pro_name: '',
        business_name: '',
        commission_rate: 20
    });
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData({
                free_name: settings.plan_names.free,
                pro_name: settings.plan_names.pro,
                business_name: settings.plan_names.business,
                commission_rate: settings.affiliate_commission_rate
            });
        }
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('app_settings')
                .update({
                    settings: {
                        plan_names: {
                            free: formData.free_name,
                            pro: formData.pro_name,
                            business: formData.business_name
                        },
                        affiliate_commission_rate: formData.commission_rate
                    }
                })
                .eq('id', 'global');

            if (error) throw error;

            await refreshSettings();
            setStatus({ type: 'success', message: 'Configuración actualizada correctamente' });

            setTimeout(() => setStatus(null), 3000);
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setStatus({ type: 'error', message: 'Error al guardar: ' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Settings2 className="w-8 h-8 text-primary" />
                        Configuración de Negocio
                    </h2>
                    <p className="text-slate-400 mt-2">Gestiona el branding de los planes y las políticas de afiliación global.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Planes Section */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Nombres Comerciales de Planes</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Plan Starter (free)</label>
                            <input
                                type="text"
                                value={formData.free_name}
                                onChange={(e) => setFormData({ ...formData, free_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Ej: Starter"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Plan Business (pro)</label>
                            <input
                                type="text"
                                value={formData.pro_name}
                                onChange={(e) => setFormData({ ...formData, pro_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Ej: Business"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Plan Enterprise (business)</label>
                            <input
                                type="text"
                                value={formData.business_name}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Ej: Enterprise"
                            />
                        </div>
                    </div>
                </div>

                {/* Affiliate Section */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <Percent className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Comisión de Afiliados</h3>
                    </div>

                    <div className="max-w-xs space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Porcentaje de Comisión (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors pr-12"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-white/5 p-4 rounded-xl border border-white/5">
                            <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Este valor se aplicará a todos los cálculos del Webhook de Stripe para comisiones recurrentes. No afecta a pagos ya procesados.</p>
                        </div>
                    </div>
                </div>

                {/* Status Box */}
                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "flex items-center gap-3 p-5 rounded-2xl border",
                            status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="font-medium text-sm">{status.message}</p>
                    </motion.div>
                )}

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="group relative flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 transition-transform"
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Save className="w-6 h-6 transition-transform group-hover:scale-110" />
                        )}
                        <span>Guardar Configuración Global</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
