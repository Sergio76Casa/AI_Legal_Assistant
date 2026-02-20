import React from 'react';
import { useTenant } from '../lib/TenantContext';
import {
    Phone, Mail, Facebook, Instagram, Twitter, Linkedin,
    MapPin, Globe, FileText, LayoutGrid, Building2, TrendingUp, ShieldCheck
} from 'lucide-react';

interface DynamicFooterProps {
    tenant?: any;
    onOpenLegal?: (type: 'privacy' | 'cookies' | 'legal') => void;
    onOpenService?: (type: 'documents' | 'templates' | 'organization' | 'affiliates') => void;
}

export const DynamicFooter: React.FC<DynamicFooterProps> = ({ tenant: propTenant, onOpenLegal, onOpenService }) => {
    const { tenant: contextTenant } = useTenant();
    const tenant = propTenant || contextTenant;

    if (!tenant) return null;

    const config = tenant.config || {};
    const offices = config.offices || [];
    const social = config.social_media || {};

    return (
        <footer className="w-full bg-[#0a0f1d] pt-20 pb-12 border-t border-white/5">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Columna 1: Identidad */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            {config.show_logo && config.logo_url ? (
                                <img src={config.logo_url} alt={tenant.name} className="h-10 w-auto object-contain" />
                            ) : (
                                <span className="text-xl font-black text-white tracking-tighter uppercase">{tenant.name}</span>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs italic">
                            {config.description || "Soluciones inteligentes para la gestión legal y documental de tu empresa."}
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                            {config.partner_logo_url && (
                                <a href={config.partner_url || '#'} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.partner_logo_url} className="h-8 object-contain" alt="Partner" />
                                </a>
                            )}
                            {config.iso_logo_url && (
                                <div className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.iso_logo_url} className="h-12 object-contain" alt="ISO" />
                                </div>
                            )}
                            {config.extra_logo_url && (
                                <a href={config.extra_url || '#'} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.extra_logo_url} className="h-8 object-contain" alt="Logo Extra" />
                                </a>
                            )}
                        </div>

                        {/* Social Media */}
                        <div className="flex items-center gap-3 pt-4">
                            {social.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all">
                                    <Facebook size={16} />
                                </a>
                            )}
                            {social.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all">
                                    <Instagram size={16} />
                                </a>
                            )}
                            {social.twitter && (
                                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all">
                                    <Twitter size={16} />
                                </a>
                            )}
                            {social.linkedin && (
                                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all">
                                    <Linkedin size={16} />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Servicios</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li>
                                <button
                                    onClick={() => onOpenService?.('documents')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <FileText size={16} className="text-primary/40 group-hover:text-primary" />
                                    Mis Documentos
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenService?.('templates')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <LayoutGrid size={16} className="text-primary/40 group-hover:text-primary" />
                                    Plantillas PDF
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenService?.('organization')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <Building2 size={16} className="text-primary/40 group-hover:text-primary" />
                                    Mi Organización
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenService?.('affiliates')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <TrendingUp size={16} className="text-primary/40 group-hover:text-primary" />
                                    Programa de Afiliados
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Legal */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li>
                                <button
                                    onClick={() => onOpenLegal?.('privacy')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <FileText size={16} className="text-primary/40 group-hover:text-primary" />
                                    Política de Privacidad
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenLegal?.('cookies')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <Globe size={16} className="text-primary/40 group-hover:text-primary" />
                                    Política de Cookies
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onOpenLegal?.('legal')}
                                    className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                >
                                    <ShieldCheck size={16} className="text-primary/40 group-hover:text-primary" />
                                    Aviso Legal
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 4: Contacto */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Contacto</h4>
                        <div className="space-y-6">
                            {/* Sedes */}
                            {offices.map((office: any, idx: number) => (
                                office.label && office.address && (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black uppercase text-white tracking-widest leading-none mb-1.5">{office.label}</div>
                                            <div className="text-xs text-slate-500 leading-relaxed font-medium">{office.address}</div>
                                        </div>
                                    </div>
                                )
                            ))}

                            {/* Teléfono y Email */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                {config.contact_phone && (
                                    <a href={`tel:${config.contact_phone}`} className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group">
                                        <div className="text-primary/40 group-hover:text-primary">
                                            <Phone size={18} />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{config.contact_phone}</span>
                                    </a>
                                )}
                                {config.contact_email && (
                                    <a href={`mailto:${config.contact_email}`} className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group">
                                        <div className="text-primary/40 group-hover:text-primary">
                                            <Mail size={18} />
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{config.contact_email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} {tenant.name} • Todos los derechos reservados
                    </p>
                </div>
            </div>
        </footer>
    );
};
