import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Plus, Trash2, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContactSectionProps {
    contact: any;
    setContact: (data: any) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contact, setContact }) => {
    const handleUpdate = (field: string, value: any) => {
        setContact({ ...contact, [field]: value });
    };

    const handleSocialUpdate = (platform: string, value: string) => {
        setContact({
            ...contact,
            social: { ...contact.social, [platform]: value }
        });
    };

    const addOffice = () => {
        setContact({
            ...contact,
            offices: [...contact.offices, { id: Math.random().toString(36).substring(7), name: '', address: '' }]
        });
    };

    const updateOffice = (id: string, field: string, value: string) => {
        setContact({
            ...contact,
            offices: contact.offices.map((o: any) => o.id === id ? { ...o, [field]: value } : o)
        });
    };

    const removeOffice = (id: string) => {
        setContact({
            ...contact,
            offices: contact.offices.filter((o: any) => o.id !== id)
        });
    };

    return (
        <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <MapPin size={180} className="text-primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 relative z-10">
                {/* Contact Basics */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors flex items-center gap-2">
                                <Phone size={12} /> Teléfono Global
                            </label>
                            <input
                                type="text"
                                value={contact.phone}
                                onChange={e => handleUpdate('phone', e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/10 hover:border-primary/30 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="+34 000 000 000"
                            />
                        </div>
                        <div className="flex flex-col gap-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors flex items-center gap-2">
                                <Mail size={12} /> Email de Contacto
                            </label>
                            <input
                                type="email"
                                value={contact.email}
                                onChange={e => handleUpdate('email', e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/10 hover:border-primary/30 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-700"
                                placeholder="contacto@tuempresa.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Redes Sociales</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
                                { id: 'twitter', icon: Twitter, label: 'Twitter / X', color: 'hover:text-sky-400' },
                                { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
                                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-600' },
                                { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'hover:text-emerald-500' }
                            ].map((social) => (
                                <div key={social.id} className="relative group">
                                    <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-primary", social.color)}>
                                        <social.icon size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={social.label}
                                        value={contact.social[social.id]}
                                        onChange={e => handleSocialUpdate(social.id, e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Offices Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Oficinas Físicas</label>
                        <button
                            onClick={addOffice}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 rounded-xl border border-primary/20 transition-all group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {contact.offices.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center text-slate-600"
                                >
                                    <MapPin size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No hay oficinas registradas</p>
                                </motion.div>
                            ) : (
                                contact.offices.map((office: any) => (
                                    <motion.div
                                        key={office.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                        className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl group/office hover:border-primary/20 transition-all space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <Building size={14} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={office.name}
                                                    onChange={e => updateOffice(office.id, 'name', e.target.value)}
                                                    className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 outline-none w-full"
                                                    placeholder="Nombre de la Sede (Ej. Madrid)"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeOffice(office.id)}
                                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover/office:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="relative group/addr">
                                            <MapPin size={12} className="absolute left-3 top-3.5 text-slate-600 group-focus-within/addr:text-primary transition-colors" />
                                            <textarea
                                                value={office.address}
                                                onChange={e => updateOffice(office.id, 'address', e.target.value)}
                                                rows={2}
                                                className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-400 focus:text-white focus:border-primary/30 outline-none transition-all resize-none"
                                                placeholder="Dirección completa..."
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
