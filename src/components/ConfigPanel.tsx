import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import {
    Globe, Phone, Mail, Facebook, Instagram, Twitter, Linkedin,
    Plus, Trash2, Upload, Building, ImageIcon,
    MapPin, Save, Loader2, Settings, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const ConfigPanel: React.FC = () => {
    const { tenant, refreshTenant } = useTenant();
    const [saving, setSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Form State
    const [identity, setIdentity] = useState({
        name: '',
        show_logo: true,
        description: '',
        logo_url: '',
        partner_logo_url: '',
        partner_url: '',
        iso_logo_url: '',
        extra_logo_url: '',
        extra_url: ''
    });

    const [contact, setContact] = useState({
        phone: '',
        email: '',
        offices: [{ label: '', address: '' }],
        social: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        if (tenant) {
            const config = tenant.config || {};
            setIdentity({
                name: tenant.name || '',
                show_logo: config.show_logo ?? true,
                description: config.description || '',
                logo_url: config.logo_url || '',
                partner_logo_url: config.partner_logo_url || '',
                partner_url: config.partner_url || '',
                iso_logo_url: config.iso_logo_url || '',
                extra_logo_url: config.extra_logo_url || '',
                extra_url: config.extra_url || ''
            });
            setContact({
                phone: config.contact_phone || '',
                email: config.contact_email || '',
                offices: config.offices || [{ label: '', address: '' }],
                social: config.social_media || {
                    facebook: '',
                    instagram: '',
                    twitter: '',
                    linkedin: ''
                }
            });
        }
    }, [tenant]);

    const handleSave = async (silent = false) => {
        if (!tenant) return;
        if (!silent) setSaving(true);
        try {
            const newConfig = {
                ...tenant.config,
                show_logo: identity.show_logo,
                description: identity.description,
                logo_url: identity.logo_url,
                partner_logo_url: identity.partner_logo_url,
                partner_url: identity.partner_url,
                iso_logo_url: identity.iso_logo_url,
                extra_logo_url: identity.extra_logo_url,
                extra_url: identity.extra_url,
                contact_phone: contact.phone,
                contact_email: contact.email,
                offices: contact.offices,
                social_media: contact.social
            };

            const { error } = await supabase
                .from('tenants')
                .update({
                    name: identity.name,
                    config: newConfig
                })
                .eq('id', tenant.id);

            if (error) throw error;
            await refreshTenant();
            if (!silent) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                alert('Error al guardar configuración. Verifica tus permisos de administrador.');
                setStatus('error');
            }
        } finally {
            if (!silent) setSaving(false);
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

            // Actualizamos localmente
            const updatedIdentity = { ...identity, [field]: publicUrl };
            setIdentity(updatedIdentity);

            // Auto-guardamos para evitar que se pierda la subida
            const newConfig = {
                ...tenant.config,
                [field]: publicUrl
            };

            await supabase
                .from('tenants')
                .update({ config: newConfig })
                .eq('id', tenant.id);

            await refreshTenant();
        } catch (err) {
            console.error(err);
            alert('Error al subir imagen. El archivo podría ser demasiado grande o el formato no ser válido.');
        } finally {
            setUploadingField(null);
        }
    };

    const addOffice = () => {
        setContact({ ...contact, offices: [...contact.offices, { label: '', address: '' }] });
    };

    const removeOffice = (index: number) => {
        const newOffices = contact.offices.filter((_, i) => i !== index);
        setContact({ ...contact, offices: newOffices.length ? newOffices : [{ label: '', address: '' }] });
    };

    const updateOffice = (index: number, field: 'label' | 'address', value: string) => {
        const newOffices = [...contact.offices];
        newOffices[index][field] = value;
        setContact({ ...contact, offices: newOffices });
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
                    <p className="text-slate-500 mt-1 italic">Gestiona la identidad visual y los datos de contacto que se muestran en tu portal público.</p>
                </div>
                <div className="flex items-center gap-4">
                    {status === 'success' && (
                        <span className="text-primary text-xs font-bold flex items-center gap-2 animate-fade-in">
                            <CheckCircle2 size={16} />
                            ¡Cambios guardados!
                        </span>
                    )}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg disabled:opacity-50",
                            status === 'success'
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-primary text-slate-900 hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Guardando...' : status === 'success' ? 'Guardado' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* BLOQUE 1: IDENTIDAD */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <Building size={120} />
                </div>

                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                    <Building className="text-primary/70" size={24} />
                    <h3 className="text-xl font-bold text-white">Identidad Visual</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre de la Organización</label>
                            <input
                                type="text"
                                value={identity.name}
                                onChange={e => setIdentity({ ...identity, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Toggle Logo */}
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Mostrar Logo</span>
                                <span className="text-[10px] text-slate-500 italic">Si se desactiva, se mostrará el nombre en texto.</span>
                            </div>
                            <button
                                onClick={() => setIdentity({ ...identity, show_logo: !identity.show_logo })}
                                className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                    identity.show_logo ? "bg-primary" : "bg-slate-700"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                                    identity.show_logo ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Eslogan / Descripción Breve</label>
                            <div className="relative">
                                <textarea
                                    value={identity.description}
                                    onChange={e => setIdentity({ ...identity, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all resize-none text-sm leading-relaxed"
                                    placeholder="Ej: Soluciones legales avanzadas para la era digital..."
                                />
                                <div className="absolute right-3 bottom-3 text-slate-600">
                                    <Globe size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Logo Principal con Uploader */}
                        <div className="relative group/logo">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Logo Principal</label>
                            <div className={cn(
                                "relative h-44 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
                                !identity.logo_url && "hover:border-primary/30 hover:bg-primary/5"
                            )}>
                                {identity.logo_url ? (
                                    <>
                                        <img src={identity.logo_url} alt="Logo" className="max-h-[80%] max-w-[80%] object-contain p-4" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                            <label className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer transition-colors">
                                                <Upload size={20} />
                                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('logo_url', e.target.files[0])} />
                                            </label>
                                            <button
                                                onClick={() => setIdentity({ ...identity, logo_url: '' })}
                                                className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-3 text-slate-500 hover:text-primary transition-colors py-8 w-full h-full justify-center">
                                        {uploadingField === 'logo_url' ? <Loader2 className="animate-spin text-primary" size={40} /> : <Upload size={40} className="opacity-20" />}
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{uploadingField === 'logo_url' ? 'Subiendo...' : 'Subir Imagen'}</span>
                                        <input type="file" className="hidden" accept="image/*" disabled={!!uploadingField} onChange={e => {
                                            if (e.target.files?.[0]) handleFileUpload('logo_url', e.target.files[0]);
                                        }} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Logos Secundarios (Partner e ISO) con Uploader Mini */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Logo Partner */}
                            <div className="group/partner">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Partner</label>
                                <div className="relative h-28 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                                    {identity.partner_logo_url ? (
                                        <>
                                            <img src={identity.partner_logo_url} className="max-h-[60%] object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/partner:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors">
                                                    <Upload size={14} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('partner_logo_url', e.target.files[0])} />
                                                </label>
                                                <button onClick={() => setIdentity({ ...identity, partner_logo_url: '' })} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-1.5 text-slate-600 hover:text-primary transition-all">
                                            {uploadingField === 'partner_logo_url' ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} className="opacity-40" />}
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Subir</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('partner_logo_url', e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enlace partner..."
                                    value={identity.partner_url}
                                    onChange={e => setIdentity({ ...identity, partner_url: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-slate-500 focus:ring-1 focus:ring-primary/30 outline-none"
                                />
                            </div>

                            {/* Logo ISO */}
                            <div className="group/iso">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sello ISO</label>
                                <div className="relative h-28 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden mb-3 text-center">
                                    {identity.iso_logo_url ? (
                                        <>
                                            <img src={identity.iso_logo_url} className="max-h-[60%] object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/iso:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors">
                                                    <Upload size={14} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('iso_logo_url', e.target.files[0])} />
                                                </label>
                                                <button onClick={() => setIdentity({ ...identity, iso_logo_url: '' })} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-1.5 text-slate-600 hover:text-primary transition-all">
                                            {uploadingField === 'iso_logo_url' ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} className="opacity-40" />}
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Subir ISO</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('iso_logo_url', e.target.files[0])} />
                                        </label>
                                    )}
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
            </div>

            {/* BLOQUE 2: DATOS DE CONTACTO */}
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
                            {contact.offices.map((office, idx) => (
                                <div key={idx} className="flex gap-4 items-start group/office">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl group-hover/office:border-white/20 transition-all">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Identificador</label>
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                                <Building size={14} className="text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={office.label}
                                                    onChange={e => updateOffice(idx, 'label', e.target.value)}
                                                    placeholder="Contral: Ciudad, Sede..."
                                                    className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-slate-700 font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Ubicación Física</label>
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                                <MapPin size={14} className="text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={office.address}
                                                    onChange={e => updateOffice(idx, 'address', e.target.value)}
                                                    placeholder="Dirección completa..."
                                                    className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-slate-700 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeOffice(idx)}
                                        className="mt-8 p-3 text-slate-600 hover:text-red-400 opacity-0 group-hover/office:opacity-100 transition-all bg-red-400/5 rounded-xl hover:bg-red-400/10"
                                        title="Eliminar esta sede"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contacto Directo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Teléfono de Atención</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 group focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                <Phone size={22} className="text-slate-600 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                                    placeholder="+34 000 000 000"
                                    className="bg-transparent border-none outline-none text-white w-full text-base font-bold placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Email de Soporte</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 group focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                <Mail size={22} className="text-slate-600 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={contact.email}
                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                    placeholder="contacto@empresa.com"
                                    className="bg-transparent border-none outline-none text-white w-full text-base font-bold placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Redes Sociales */}
                    <div className="pt-10 border-t border-white/5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Presencia en Redes Sociales</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'facebook', icon: Facebook, color: 'hover:text-blue-500' },
                                { id: 'instagram', icon: Instagram, color: 'hover:text-pink-500' },
                                { id: 'twitter', icon: Twitter, color: 'hover:text-sky-400' },
                                { id: 'linkedin', icon: Linkedin, color: 'hover:text-blue-600' }
                            ].map((net) => (
                                <div key={net.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 group focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                                    <net.icon size={18} className={cn("text-slate-600 transition-colors", net.color)} />
                                    <input
                                        type="text"
                                        value={(contact.social as any)[net.id]}
                                        onChange={e => setContact({ ...contact, social: { ...contact.social, [net.id]: e.target.value } })}
                                        placeholder={`URL ${net.id.charAt(0).toUpperCase() + net.id.slice(1)}...`}
                                        className="bg-transparent border-none outline-none text-[10px] text-white w-full font-bold placeholder:text-slate-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
