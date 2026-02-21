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
    MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface ConfigPanelProps {
    tenant: any;
    refreshTenant: () => Promise<void>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ tenant, refreshTenant }) => {
    // We remove the unused destructuring since t is unused
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [uploadingField, setUploadingField] = useState<string | null>(null);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Settings className="text-primary" size={28} />
                        Configuración de Marca y Contacto
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Personaliza la identidad visual y los datos de contacto de tu organización.</p>
                </div>

                <div className="flex items-center gap-3">
                    {status === 'success' && (
                        <span className="text-emerald-400 text-xs font-bold animate-fade-in flex items-center gap-1">
                            <CheckCircle2 size={14} /> Guardado con éxito
                        </span>
                    )}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving || translating}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg",
                            saving || translating
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-primary text-slate-900 hover:scale-105 active:scale-95 shadow-primary/20"
                        )}
                    >
                        {(saving || translating) ? <Loader2 size={18} className="animate-spin" /> : null}
                        {saving ? 'Guardando...' : translating ? 'Traduciendo...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* BLOQUE 1: IDENTIDAD VISUAL */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <ImageIcon size={120} />
                </div>

                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <ImageIcon className="text-primary/70" size={24} />
                    <h3 className="text-xl font-bold text-white">Identidad Visual</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre de la Organización</label>
                            <input
                                type="text"
                                value={identity.name}
                                onChange={e => setIdentity({ ...identity, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Eslogan / Descripción Breve</label>
                            <textarea
                                value={identity.description}
                                onChange={e => setIdentity({ ...identity, description: e.target.value })}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white">Mostrar Logo en el Footer</p>
                                <p className="text-[10px] text-slate-500">Si se desactiva, se mostrará el nombre en texto.</p>
                            </div>
                            <button
                                onClick={() => setIdentity({ ...identity, show_logo: !identity.show_logo })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    identity.show_logo ? "bg-primary" : "bg-slate-700"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                    identity.show_logo ? "left-7" : "left-1"
                                )} />
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

            {/* BLOQUE 2: PERSONALIZACIÓN DEL FOOTER */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <LayoutGrid size={120} />
                </div>

                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                        <LayoutGrid className="text-primary/70" size={24} />
                        <div>
                            <h3 className="text-xl font-bold text-white">Información Interactiva (Modal)</h3>
                            <div className="flex items-center gap-3 mt-1">
                                {translationSuccess ? (
                                    <div className="flex items-center gap-1.5 text-primary animate-fade-in">
                                        <CheckCircle2 size={12} className="animate-bounce-subtle" />
                                        <p className="text-[10px] font-bold uppercase tracking-wider">Traducciones e iconos optimizados por IA</p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-500 italic">Escribe un título y un texto informativo. La IA lo traducirá y asignará un logo automáticamente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addFooterLink}
                        disabled={translating || !tenant}
                        className={cn(
                            "relative z-10 text-xs font-bold text-primary flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10",
                            (translating || !tenant) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {translating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Nuevo Enlace
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {(Array.isArray(footerLinks) ? footerLinks : []).map((link) => (
                        <div key={link.id} className={cn(
                            "flex flex-col md:flex-row gap-4 p-5 bg-white/5 border rounded-2xl transition-all",
                            link.protected ? "border-primary/20 bg-primary/5" : "border-white/10 group-hover:border-white/20"
                        )}>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] h-4 flex items-center gap-2">
                                        Título del Enlace
                                        {link.protected && <ShieldCheck size={10} className="text-primary/70" />}
                                    </label>
                                    <input
                                        type="text"
                                        value={link.title || ''}
                                        onChange={e => updateFooterLink(link.id, 'title', e.target.value)}
                                        disabled={link.protected}
                                        placeholder="Ej: Mis Documentos..."
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white w-full outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] h-4 flex items-center">Contenido / Texto</label>
                                    <textarea
                                        value={link.content || ''}
                                        onChange={e => updateFooterLink(link.id, 'content', e.target.value)}
                                        disabled={link.protected}
                                        rows={1}
                                        placeholder="Este texto se mostrará en un modal..."
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white w-full outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50 resize-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] h-4 flex items-center">Sección</label>
                                    <select
                                        value={link.section}
                                        onChange={e => updateFooterLink(link.id, 'section', e.target.value)}
                                        disabled={link.protected}
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white w-full outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                                    >
                                        <option value="services" className="bg-slate-900">Servicios</option>
                                        <option value="legal" className="bg-slate-900">Legal</option>
                                    </select>
                                </div>
                            </div>
                            {!link.protected && (
                                <button
                                    onClick={() => removeFooterLink(link.id)}
                                    className="self-center p-3 text-slate-600 hover:text-red-400 bg-red-400/5 rounded-xl hover:bg-red-400/10 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    {footerLinks.length === 0 && (
                        <div className="text-center py-10 text-slate-600 italic text-sm">No hay enlaces personalizados.</div>
                    )}
                </div>
            </div>

            {/* BLOQUE 3: DATOS DE CONTACTO */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <Phone size={120} />
                </div>

                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <Phone className="text-primary/70" size={24} />
                    <h3 className="text-xl font-bold text-white">Información de Contacto</h3>
                </div>

                <div className="space-y-10">
                    {/* Sedes Multi-Oficina */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Direcciones y Delegaciones</label>
                            <button
                                onClick={addOffice}
                                className="text-xs font-bold text-primary flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10"
                            >
                                <Plus size={14} />
                                Nueva Delegación
                            </button>
                        </div>
                        <div className="space-y-4">
                            {contact.offices.map((office) => (
                                <div key={office.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl relative group/office">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <Building size={12} className="text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Nombre (Ej: Oficina Madrid)"
                                                value={office.name}
                                                onChange={e => updateOffice(office.id, 'name', e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-white font-bold w-full outline-none placeholder:text-slate-700"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Dirección completa..."
                                                value={office.address}
                                                onChange={e => updateOffice(office.id, 'address', e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-slate-400 w-full outline-none placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeOffice(office.id)}
                                        className="md:absolute md:-right-2 md:-top-2 md:opacity-0 group-hover/office:opacity-100 p-2 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg border border-white/5 transition-all shadow-xl"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {contact.offices.length === 0 && (
                                <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl text-slate-700 text-xs">Añade al menos una dirección principal.</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Teléfono y Email */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Phone size={12} /> Teléfono Principal
                                </label>
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Mail size={12} /> Email de Atención
                                </label>
                                <input
                                    type="email"
                                    value={contact.email}
                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Presencia en Redes Sociales</label>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                                    <Globe size={14} className="text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="https://facebook.com/..."
                                        value={contact.social.facebook}
                                        onChange={e => setContact({ ...contact, social: { ...contact.social, facebook: e.target.value } })}
                                        className="bg-transparent border-none p-0 text-xs text-white w-full outline-none placeholder:text-slate-700 font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                                    <ImageIcon size={14} className="text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="https://instagram.com/..."
                                        value={contact.social.instagram}
                                        onChange={e => setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })}
                                        className="bg-transparent border-none p-0 text-xs text-white w-full outline-none placeholder:text-slate-700 font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                                    <MessageSquare size={14} className="text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Número WhatsApp (Ej: 34600000000)"
                                        value={contact.social.whatsapp}
                                        onChange={e => setContact({ ...contact, social: { ...contact.social, whatsapp: e.target.value } })}
                                        className="bg-transparent border-none p-0 text-xs text-white w-full outline-none placeholder:text-slate-700 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
