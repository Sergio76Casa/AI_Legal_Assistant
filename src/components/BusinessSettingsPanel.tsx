import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppSettings } from '../lib/AppSettingsContext';
import { Save, Settings2, ShieldCheck, Percent, HelpCircle, Loader2, CheckCircle2, AlertCircle, Lock, Briefcase } from 'lucide-react';
import { ViewHeader } from './Admin/ViewHeader';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const BusinessSettingsPanel: React.FC = () => {
    const { settings, refreshSettings } = useAppSettings();
    const [formData, setFormData] = useState<{
        free_name: string;
        pro_name: string;
        business_name: string;
        commission_rate: number;
    }>({
        free_name: '',
        pro_name: '',
        business_name: '',
        commission_rate: 20
    });
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
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

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.new || passwords.new !== passwords.confirm) {
            setStatus({ type: 'error', message: 'Las contraseñas no coinciden' });
            return;
        }

        setIsUpdatingPassword(true);
        setStatus(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            setStatus({ type: 'success', message: 'Contraseña actualizada con éxito' });
            setPasswords({ new: '', confirm: '' });
            setTimeout(() => setStatus(null), 3000);
        } catch (error: any) {
            console.error('Error updating password:', error);
            setStatus({ type: 'error', message: 'Error: ' + error.message });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Briefcase} 
                title="Configuración de Negocio" 
                subtitle="Gestión global de identidades y políticas comerciales"
                badge="Administración General"
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 space-y-10">

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

                <div className="flex justify-end pt-20">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={cn(
                            "px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_20px_50px_rgba(var(--primary),0.3)] active:scale-95 disabled:opacity-50 group border border-primary/20",
                            isSaving ? "bg-slate-800 text-slate-500" : "bg-primary text-slate-900 hover:scale-[1.05] hover:shadow-primary/40"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Save className="w-6 h-6 transition-transform group-hover:scale-110" />
                        )}
                        <span>{isSaving ? 'Sincronizando...' : 'Actualizar Configuración'}</span>
                    </button>
                </div>
            </form>

            <div className="h-px bg-white/5 my-12" />

            {/* Security Section (Independent Form) */}
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-3 mb-8">
                        <Lock className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Seguridad de la Cuenta</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400">Establece una contraseña para poder acceder sin Google en el futuro.</p>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-end gap-6">
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <ShieldCheck className="w-4 h-4 inline mr-2 text-primary" />
                                    Al actualizar la contraseña, podrás iniciar sesión indistintamente con tu cuenta de Google o con tu correo y la nueva contraseña.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdatingPassword || !passwords.new}
                                className="group relative flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-50 active:scale-95 transition-transform"
                            >
                                {isUpdatingPassword ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                )}
                                <span>Establecer Contraseña</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
};
