import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Plus,
    Trash2,
    Settings,
    Phone,
    Mail,
    MapPin,
    Globe,
    Building,
    Loader2,
    CheckCircle2,
    Upload,
    Image as ImageIcon,
    ShieldCheck,
    Info,
    MessageSquare,
    Check,
    Sparkles,
    ChevronDown,
    CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfigPanelProps {
    tenant: any;
    refreshTenant: () => Promise<void>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ tenant, refreshTenant }) => {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
    const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
        identity: true,
        footer: false,
        contact: false,
        plans: false
    });

    const toggleBlock = (block: string) => {
        setExpandedBlocks(prev => ({
            ...prev,
            [block]: !prev[block]
        }));
    };

    // Form states
    const [identity, setIdentity] = useState({
        name: '',
        description: '',
        logo_url: '',
        partner_logo_url: '',
        partner_url: '',
        iso_logo_url: '',
        extra_logo_url: '',
        extra_url: '',
        show_logo: true
    });

    const [contact, setContact] = useState({
        phone: '',
        email: '',
        offices: [] as any[],
        social: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            whatsapp: ''
        }
    });

    const [footerLinks, setFooterLinks] = useState<any[]>([]);
    const [translating, setTranslating] = useState(false);
    const [translationSuccess, setTranslationSuccess] = useState(false);

    useEffect(() => {
        if (tenant) {
            const config = tenant.config || {};
            setIdentity({
                name: tenant.name || '',
                description: config.description || '',
                logo_url: config.logo_url || '',
                partner_logo_url: config.partner_logo_url || '',
                partner_url: config.partner_url || '',
                iso_logo_url: config.iso_logo_url || '',
                extra_logo_url: config.extra_logo_url || '',
                extra_url: config.extra_url || '',
                show_logo: config.show_logo !== false
            });

            setContact({
                phone: config.contact_phone || '',
                email: config.contact_email || '',
                offices: config.offices || [],
                social: config.social_media || {
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: '',
                    whatsapp: ''
                }
            });

            // Fetch footer links from organization_settings
            const fetchFooterSettings = async () => {
                const { data } = await supabase
                    .from('organization_settings')
                    .select('footer_custom_links')
                    .eq('tenant_id', tenant.id)
                    .single();

                if (data?.footer_custom_links && data.footer_custom_links.length > 0) {
                    setFooterLinks(data.footer_custom_links);
                } else {
                    const defaults = [
                        { id: 'docs', title: 'Información Legal', content: 'Contenido legal de la plataforma...', section: 'legal' }
                    ];
                    setFooterLinks(defaults);
                }
            };
            fetchFooterSettings();
        }
    }, [tenant]);

    const handleTranslate = async (links: any[]) => {
        setTranslating(true);
        try {
            const newLinks = [...links];
            for (let i = 0; i < newLinks.length; i++) {
                const link = newLinks[i];
                if (typeof link.title === 'string' && link.title.trim().length > 0) {
                    const { data, error } = await supabase.functions.invoke('translate-footer', {
                        body: {
                            title: link.title,
                            content: link.content || '',
                            sourceLang: 'auto'
                        }
                    });
                    if (error) throw error;

                    if (data && data.translations) {
                        link.translations = data.translations;
                        link.icon = data.icon || link.icon;
                    }
                }
            }
            setTranslationSuccess(true);
            setTimeout(() => setTranslationSuccess(false), 5000);
            return newLinks;
        } catch (err) {
            console.error('Translation error:', err);
            return links;
        } finally {
            setTranslating(false);
        }
    };

    const handleFileUpload = async (field: string, file: File) => {
        if (!tenant) return;
        setUploadingField(field);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${tenant.id}/${field}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('tenant-assets')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName);

            setIdentity(prev => ({ ...prev, [field]: publicUrl }));
        } catch (err) {
            console.error(err);
            alert('Error al subir imagen');
        } finally {
            setUploadingField(null);
        }
    };

    const handleUpdatePlan = async (newPlan: string) => {
        if (!tenant || updatingPlan) return;
        setUpdatingPlan(newPlan);
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ plan: newPlan })
                .eq('id', tenant.id);

            if (error) throw error;
            await refreshTenant();
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el plan');
            setStatus('error');
        } finally {
            setUpdatingPlan(null);
        }
    };

    const plans = [
        {
            id: 'free',
            name: t('landing.pricing.plans.free.name'),
            tag: 'STARTER',
            price: '49€/mes',
            icon: 'person',
            features: t('landing.pricing.plans.free.features', { returnObjects: true }) as string[] || []
        },
        {
            id: 'pro',
            name: t('landing.pricing.plans.pro.name'),
            tag: 'BUSINESS',
            price: '149€/mes',
            icon: 'groups',
            features: t('landing.pricing.plans.pro.features', { returnObjects: true }) as string[] || []
        },
        {
            id: 'business',
            name: t('landing.pricing.plans.business.name'),
            tag: 'ENTERPRISE',
            price: '399€/mes',
            icon: 'domain',
            features: t('landing.pricing.plans.business.features', { returnObjects: true }) as string[] || []
        }
    ];

    const handleSave = async (silent = false) => {
        if (!tenant) return;
        if (!silent) {
            setSaving(true);
            setStatus('saving');
        }

        try {
            // 1. Traducir
            const translatedLinks = await handleTranslate(footerLinks);

            // 2. Guardar en tenants
            const newConfig = {
                ...tenant.config,
                ...identity,
                contact_phone: contact.phone,
                contact_email: contact.email,
                offices: contact.offices,
                social_media: contact.social
            };

            const { error: tenantError } = await supabase
                .from('tenants')
                .update({
                    name: identity.name,
                    config: newConfig
                })
                .eq('id', tenant.id);

            if (tenantError) throw tenantError;

            // 3. Guardar en organization_settings
            const { error: settingsError } = await supabase
                .from('organization_settings')
                .upsert({
                    tenant_id: tenant.id,
                    footer_custom_links: translatedLinks
                }, { onConflict: 'tenant_id' });

            if (settingsError) throw settingsError;

            await refreshTenant();
            if (!silent) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                const message = (err as any)?.message || 'Verifica tu conexión o permisos';
                alert(`No se pudo guardar: ${message}`);
                setStatus('error');
            }
        } finally {
            if (!silent) setSaving(false);
        }
    };

    const addFooterLink = React.useCallback(() => {
        setFooterLinks(prev => {
            const currentLinks = Array.isArray(prev) ? prev : [];
            if (currentLinks.length >= 8) {
                alert('Máximo 8 bloques permitidos.');
                return currentLinks;
            }
            const newId = Math.random().toString(36).substring(2, 11);
            return [...currentLinks, { id: newId, title: '', content: '', section: 'services' }];
        });
    }, []);

    const removeFooterLink = (id: string) => {
        setFooterLinks(prev => {
            const currentLinks = Array.isArray(prev) ? prev : [];
            return currentLinks.filter(l => l.id !== id && !l.protected);
        });
    };

    const updateFooterLink = (id: string, field: string, value: string) => {
        setFooterLinks(prev => {
            const currentLinks = Array.isArray(prev) ? prev : [];
            return currentLinks.map(l => l.id === id ? { ...l, [field]: value } : l);
        });
    };

    const addOffice = () => {
        setContact(prev => ({
            ...prev,
            offices: [...prev.offices, { id: Math.random().toString(36).substring(7), name: '', address: '' }]
        }));
    };

    const updateOffice = (id: string, field: string, value: string) => {
        setContact(prev => ({
            ...prev,
            offices: prev.offices.map(o => o.id === id ? { ...o, [field]: value } : o)
        }));
    };

    const removeOffice = (id: string) => {
        setContact(prev => ({
            ...prev,
            offices: prev.offices.filter(o => o.id !== id)
        }));
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header de Configuración */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative"
            >
                {/* Decorative glow */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Settings className="text-primary" size={24} />
                        </div>
                        Configuración de Marca
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">Personaliza la identidad visual y los datos de contacto de tu organización para ofrecer una experiencia única.</p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                className="text-emerald-400 text-xs font-bold px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center gap-1.5"
                            >
                                <CheckCircle2 size={14} /> Guardado con éxito
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving || translating}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg relative overflow-hidden group",
                            saving || translating
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                                : "bg-primary text-slate-900 border border-transparent hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] shadow-primary/20"
                        )}
                    >
                        {!saving && !translating && (
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {(saving || translating) ? <Loader2 size={18} className="animate-spin" /> : null}
                            {saving ? 'Guardando...' : translating ? 'Traduciendo...' : 'Guardar Cambios'}
                        </span>
                    </button>
                </div>
            </motion.div>

            {/* BLOQUE 1: IDENTIDAD VISUAL */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                    "bg-white/[0.02] border rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all duration-300",
                    expandedBlocks.identity ? "border-primary/30 shadow-[0_0_40px_-15px_rgba(var(--primary),0.1)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                )}
            >
                <div
                    className="p-6 md:p-8 cursor-pointer flex items-center justify-between group relative z-10"
                    onClick={() => toggleBlock('identity')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            expandedBlocks.identity ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                            <ImageIcon size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Identidad Visual</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Logos, nombre comercial y estilos</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expandedBlocks.identity ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            expandedBlocks.identity ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expandedBlocks.identity && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-opacity pointer-events-none">
                                    <ImageIcon size={180} />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">Nombre de la Organización</label>
                                            <input
                                                type="text"
                                                value={identity.name}
                                                onChange={e => setIdentity({ ...identity, name: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                                placeholder="Ej. Acme Corp Lawyers"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">Eslogan / Descripción Breve</label>
                                            <textarea
                                                value={identity.description}
                                                onChange={e => setIdentity({ ...identity, description: e.target.value })}
                                                rows={3}
                                                className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all resize-none placeholder:text-slate-600 shadow-inner"
                                                placeholder="Un despacho de abogados innovador..."
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4 p-5 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-white">Mostrar Logo en el Footer</p>
                                                <p className="text-xs text-slate-500 mt-1">Si se desactiva, renderiza el nombre en texto plano.</p>
                                            </div>
                                            <button
                                                onClick={() => setIdentity({ ...identity, show_logo: !identity.show_logo })}
                                                className={cn(
                                                    "w-14 h-7 rounded-full transition-colors relative flex items-center px-1 shrink-0",
                                                    identity.show_logo ? "bg-primary" : "bg-slate-700"
                                                )}
                                            >
                                                <motion.div
                                                    layout
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    className="w-5 h-5 rounded-full bg-white shadow-md z-10"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Logo Principal */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logo Principal</label>
                                            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden group/img">
                                                {identity.logo_url ? (
                                                    <img src={identity.logo_url} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <ImageIcon className="text-slate-800" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    {uploadingField === 'logo_url' ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-white" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload('logo_url', file);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Partner Logo */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 group flex items-center gap-2">
                                                Logo Partner
                                                <Info size={10} className="text-slate-600" />
                                            </label>
                                            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden group/img">
                                                {identity.partner_logo_url ? (
                                                    <img src={identity.partner_logo_url} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <ImageIcon className="text-slate-800" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    {uploadingField === 'partner_logo_url' ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-white" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload('partner_logo_url', file);
                                                    }} />
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="URL del Partner (Opcional)"
                                                value={identity.partner_url}
                                                onChange={e => setIdentity({ ...identity, partner_url: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-slate-500 focus:ring-1 focus:ring-primary/30 outline-none"
                                            />
                                        </div>

                                        {/* ISO / Quality Logo */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sello Calidad / ISO</label>
                                            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden group/img">
                                                {identity.iso_logo_url ? (
                                                    <img src={identity.iso_logo_url} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <ImageIcon className="text-slate-800" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    {uploadingField === 'iso_logo_url' ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-white" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload('iso_logo_url', file);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Extra Logo */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logo Adicional</label>
                                            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center overflow-hidden group/img">
                                                {identity.extra_logo_url ? (
                                                    <img src={identity.extra_logo_url} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <ImageIcon className="text-slate-800" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    {uploadingField === 'extra_logo_url' ? <Loader2 size={24} className="animate-spin text-primary" /> : <Upload size={24} className="text-white" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload('extra_logo_url', file);
                                                    }} />
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enlace adicional..."
                                                value={identity.extra_url}
                                                onChange={e => setIdentity({ ...identity, extra_url: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-slate-500 focus:ring-1 focus:ring-primary/30 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* BLOQUE 2: PERSONALIZACIÓN DEL FOOTER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                    "bg-white/[0.02] border rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all duration-300",
                    expandedBlocks.footer ? "border-primary/30 shadow-[0_0_40px_-15px_rgba(var(--primary),0.1)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                )}
            >
                <div
                    className="p-6 md:p-8 cursor-pointer flex items-center justify-between group relative z-10"
                    onClick={() => toggleBlock('footer')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            expandedBlocks.footer ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                            <LayoutGrid size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Información Interactiva</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Gestión de enlaces y traducciones IA</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expandedBlocks.footer ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            expandedBlocks.footer ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expandedBlocks.footer && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-opacity pointer-events-none">
                                    <LayoutGrid size={180} />
                                </div>

                                <div className="flex items-center justify-between mb-8 mt-6">
                                    <div className="flex-1">
                                        {translationSuccess ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 text-primary"
                                            >
                                                <div className="p-1 rounded-full bg-primary/20 animate-pulse">
                                                    <CheckCircle2 size={14} className="animate-bounce" />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">Traducciones e iconos optimizados por la IA de STARK 2.0</p>
                                            </motion.div>
                                        ) : (
                                            <p className="text-[10px] text-slate-500 font-medium">Escribe un título y un texto. Ocurre la magia: la IA STARK 2.0 lo traducirá a 10 idiomas y asignará un icono acorde al contexto.</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addFooterLink}
                                        disabled={translating || !tenant}
                                        className={cn(
                                            "relative z-10 text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary border border-primary/20 hover:text-slate-900 transition-all shadow-lg hover:shadow-primary/30 group",
                                            (translating || !tenant) && "opacity-50 cursor-not-allowed border-transparent bg-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-500 hover:shadow-none"
                                        )}
                                    >
                                        {translating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="transition-transform group-hover:rotate-90" />}
                                        Nuevo Enlace
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 relative z-10">
                                    <AnimatePresence>
                                        {(Array.isArray(footerLinks) ? footerLinks : []).map((link, i) => (
                                            <motion.div
                                                key={link.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className={cn(
                                                    "flex flex-col md:flex-row gap-5 p-5 bg-slate-900/40 border rounded-2xl transition-all shadow-sm hover:shadow-md",
                                                    link.protected ? "border-primary/30 bg-primary/5 shadow-primary/5" : "border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="flex flex-col gap-2 group/input">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 group-focus-within/input:text-primary transition-colors">
                                                            Título
                                                            {link.protected && <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1"><ShieldCheck size={10} /> BLOQUEADO</span>}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={link.title || ''}
                                                            onChange={e => updateFooterLink(link.id, 'title', e.target.value)}
                                                            disabled={link.protected}
                                                            placeholder="Ej: Mis Documentos..."
                                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-medium text-white w-full outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-40 transition-all shadow-inner"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:col-span-1 group/input">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center group-focus-within/input:text-primary transition-colors">Contenido Interno (Modal)</label>
                                                        <textarea
                                                            value={link.content || ''}
                                                            onChange={e => updateFooterLink(link.id, 'content', e.target.value)}
                                                            disabled={link.protected}
                                                            rows={1}
                                                            placeholder="Explicación detallada..."
                                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white w-full outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-40 resize-none transition-all shadow-inner"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2 group/input">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center group-focus-within/input:text-primary transition-colors">Sección del Menu</label>
                                                        <select
                                                            value={link.section}
                                                            onChange={e => updateFooterLink(link.id, 'section', e.target.value)}
                                                            disabled={link.protected}
                                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white w-full outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-40 transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="services" className="bg-slate-900">Servicios Destacados</option>
                                                            <option value="legal" className="bg-slate-900">Documentación Legal</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {!link.protected && (
                                                    <button
                                                        onClick={() => removeFooterLink(link.id)}
                                                        className="self-center p-3 text-slate-500 hover:text-red-400 bg-slate-800/50 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {footerLinks.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-slate-500 text-sm font-medium"
                                        >
                                            No hay enlaces personalizados creados todavía.
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* BLOQUE 3: DATOS DE CONTACTO */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={cn(
                    "bg-white/[0.02] border rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all duration-300",
                    expandedBlocks.contact ? "border-primary/30 shadow-[0_0_40px_-15px_rgba(var(--primary),0.1)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                )}
            >
                <div
                    className="p-6 md:p-8 cursor-pointer flex items-center justify-between group relative z-10"
                    onClick={() => toggleBlock('contact')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            expandedBlocks.contact ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                            <Phone size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Información de Contacto</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Oficinas, teléfono, email y redes sociales</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expandedBlocks.contact ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            expandedBlocks.contact ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expandedBlocks.contact && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-opacity pointer-events-none">
                                    <Phone size={180} />
                                </div>

                                <div className="space-y-10 mt-6 relative z-10">
                                    {/* Sedes Multi-Oficina */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direcciones y Delegaciones</label>
                                            <button
                                                onClick={addOffice}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary border border-primary/20 hover:text-slate-900 transition-all shadow-lg hover:shadow-primary/30 group"
                                            >
                                                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                                                Nueva Delegación
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {contact.offices.map((office, i) => (
                                                    <motion.div
                                                        key={office.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-900/40 border border-white/10 hover:border-white/20 rounded-2xl relative group/office shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex flex-col gap-2.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-hover/office:text-primary transition-colors">
                                                                    <Building size={14} />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nombre (Ej: Oficina Madrid)"
                                                                    value={office.name}
                                                                    onChange={e => updateOffice(office.id, 'name', e.target.value)}
                                                                    className="bg-transparent border-none p-0 text-sm text-white font-bold w-full outline-none placeholder:text-slate-600 focus:ring-0"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3 pl-[34px]">
                                                                <MapPin size={12} className="text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Dirección completa..."
                                                                    value={office.address}
                                                                    onChange={e => updateOffice(office.id, 'address', e.target.value)}
                                                                    className="bg-transparent border-none p-0 text-xs text-slate-400 w-full outline-none placeholder:text-slate-600 focus:ring-0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeOffice(office.id)}
                                                            className="md:absolute md:-right-3 md:-top-3 md:opacity-0 group-hover/office:opacity-100 p-2.5 text-slate-500 hover:text-red-400 bg-slate-800 rounded-xl border border-white/10 hover:border-red-500/20 transition-all shadow-xl active:scale-95"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {contact.offices.length === 0 && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-medium">Añade al menos una dirección principal.</motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Teléfono y Email */}
                                        <div className="space-y-6">
                                            <div className="flex flex-col gap-2 group/input">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 group-focus-within/input:text-primary transition-colors">
                                                    <Phone size={12} /> Teléfono Principal
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contact.phone}
                                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                                    className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                                    placeholder="+34 600 000 000"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 group/input">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 group-focus-within/input:text-primary transition-colors">
                                                    <Mail size={12} /> Email de Atención
                                                </label>
                                                <input
                                                    type="email"
                                                    value={contact.email}
                                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                                    className="w-full bg-slate-900/50 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                                                    placeholder="contacto@empresa.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Redes Sociales */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presencia en Redes Sociales</label>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-4 bg-slate-900/40 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 shadow-inner group/social">
                                                    <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-focus-within/social:text-blue-400 transition-colors">
                                                        <Globe size={16} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="https://facebook.com/..."
                                                        value={contact.social.facebook}
                                                        onChange={e => setContact({ ...contact, social: { ...contact.social, facebook: e.target.value } })}
                                                        className="bg-transparent border-none p-0 text-sm text-white w-full outline-none placeholder:text-slate-600 font-mono focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 bg-slate-900/40 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 shadow-inner group/social">
                                                    <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-focus-within/social:text-pink-400 transition-colors">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="https://instagram.com/..."
                                                        value={contact.social.instagram}
                                                        onChange={e => setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })}
                                                        className="bg-transparent border-none p-0 text-sm text-white w-full outline-none placeholder:text-slate-600 font-mono focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 bg-slate-900/40 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 shadow-inner group/social">
                                                    <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-focus-within/social:text-emerald-400 transition-colors">
                                                        <MessageSquare size={16} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Número WhatsApp (Ej: 34600000000)"
                                                        value={contact.social.whatsapp}
                                                        onChange={e => setContact({ ...contact, social: { ...contact.social, whatsapp: e.target.value } })}
                                                        className="bg-transparent border-none p-0 text-sm text-white w-full outline-none placeholder:text-slate-600 font-mono focus:ring-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={cn(
                    "bg-white/[0.02] border rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all duration-300",
                    expandedBlocks.plans ? "border-primary/30 shadow-[0_0_40px_-15px_rgba(var(--primary),0.1)]" : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                )}
            >
                <div
                    className="p-6 md:p-8 cursor-pointer flex items-center justify-between group relative z-10"
                    onClick={() => toggleBlock('plans')}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            expandedBlocks.plans ? "bg-primary/20 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}>
                            <CreditCard size={22} className="transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Plan & Suscripción</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Gestiona los límites y capacidades tecnológicas</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expandedBlocks.plans ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            expandedBlocks.plans ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                        )}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {expandedBlocks.plans && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-opacity pointer-events-none">
                                    <CreditCard size={180} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
                                    {plans.map((p, i) => {
                                        const isCurrent = (tenant?.plan || 'free') === p.id;
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                key={p.id}
                                                className={cn(
                                                    "relative p-8 rounded-3xl border transition-all duration-300 overflow-hidden group/plan flex flex-col hover:-translate-y-1",
                                                    isCurrent
                                                        ? "bg-primary/5 border-primary/50 shadow-[0_0_30px_-5px_rgba(var(--primary),0.2)]"
                                                        : "bg-slate-900/40 border-white/10 hover:border-white/20 hover:shadow-xl hover:bg-slate-900/60"
                                                )}
                                            >
                                                {/* Decorative Gradient Line */}
                                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/plan:opacity-100 transition-opacity" />

                                                {isCurrent && (
                                                    <div className="absolute top-5 right-5 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest shadow-[0_0_10px_rgba(var(--primary),0.3)] backdrop-blur-sm z-10">
                                                        <Check size={10} strokeWidth={4} /> {t('pricing.current_plan')}
                                                    </div>
                                                )}

                                                <div className="mb-6 relative z-10">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500",
                                                        isCurrent ? "bg-primary text-slate-900 shadow-[0_0_20px_rgba(var(--primary),0.5)]" : "bg-white/5 text-slate-400 group-hover/plan:bg-white/10 group-hover/plan:text-white"
                                                    )}>
                                                        <span className={cn("material-symbols-outlined text-2xl transition-transform duration-500", isCurrent ? "animate-[pulse_2s_ease-in-out_infinite]" : "group-hover/plan:scale-110")}>{p.icon}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{p.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{p.tag}</span>
                                                        <div className="h-1 w-1 rounded-full bg-white/20" />
                                                        <span className="text-sm font-bold text-slate-400">{Number(p.price) < 1000 ? `${p.price}€/mes` : 'A Medida'}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8 flex-1 relative z-10">
                                                    {p.features && Array.isArray(p.features) && p.features.map((feature, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 group/feat">
                                                            <div className={cn(
                                                                "mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm",
                                                                isCurrent ? "bg-primary text-slate-900" : "bg-white/10 text-slate-400 group-hover/plan:bg-primary/20 group-hover/plan:text-primary"
                                                            )}>
                                                                <Check size={10} strokeWidth={4} />
                                                            </div>
                                                            <span className="text-[11px] font-medium text-slate-400 group-hover/feat:text-slate-200 transition-colors leading-relaxed">
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => handleUpdatePlan(p.id)}
                                                    disabled={isCurrent || updatingPlan !== null}
                                                    className={cn(
                                                        "w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative z-10 overflow-hidden",
                                                        isCurrent
                                                            ? "bg-transparent text-primary/50 cursor-default border border-primary/20"
                                                            : "bg-white/5 text-white hover:bg-primary hover:text-slate-900 border border-white/10 hover:border-transparent active:scale-95 shadow-xl hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] group-hover/plan:border-white/20"
                                                    )}
                                                >
                                                    {updatingPlan === p.id ? (
                                                        <Loader2 size={16} className="animate-spin mx-auto" />
                                                    ) : isCurrent ? (
                                                        "Plan Actual"
                                                    ) : (
                                                        "Cambiar a este Plan"
                                                    )}
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="mt-8 flex items-start sm:items-center gap-4 p-5 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                                    <div className="p-2.5 bg-primary/20 rounded-xl relative z-10">
                                        <Sparkles className="text-primary" size={20} />
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed max-w-4xl relative z-10">
                                        Como <strong className="text-white font-bold">Administrador del Workspace</strong>, puedes gestionar los límites modificando el nivel de suscripción.
                                        Los cambios se aplican de forma instantánea al <span className="text-primary font-bold">Motor STARK 2.0™</span> y a los protocolos de seguridad <span className="text-primary font-bold">Iron Silo™</span>.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ConfigPanel;
