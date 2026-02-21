import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../lib/TenantContext';
import { supabase } from '../lib/supabase';
import {
    Phone, Mail, Facebook, Instagram, Twitter, Linkedin,
    Globe, FileText, ShieldCheck, X, LucideIcon,
    HelpCircle, Info, Scale, Scroll, FileDigit, Briefcase, MessageSquare, Zap, Building
} from 'lucide-react';

const IconMap: Record<string, LucideIcon> = {
    FileText, ShieldCheck, Globe, Building, HelpCircle, Info, Scale, Scroll, FileDigit, Briefcase, MessageSquare, Zap
};

interface DynamicFooterProps {
    tenant?: any;
    onOpenLegal?: (type: 'privacy' | 'cookies' | 'legal') => void;
    onOpenService?: (type: 'documents' | 'templates' | 'organization' | 'affiliates') => void;
}

export const DynamicFooter: React.FC<DynamicFooterProps> = ({ tenant: propTenant, onOpenLegal, onOpenService }) => {
    const { t, i18n } = useTranslation();
    const { tenant: contextTenant } = useTenant();
    const tenant = propTenant || contextTenant;
    const [footerLinks, setFooterLinks] = React.useState<any[]>([]);
    const [activeModal, setActiveModal] = React.useState<any | null>(null);

    React.useEffect(() => {
        const fetchFooterLinks = async () => {
            if (!tenant?.id) return;
            const { data } = await supabase
                .from('organization_settings')
                .select('footer_custom_links')
                .eq('tenant_id', tenant.id)
                .single();

            if (data?.footer_custom_links) {
                setFooterLinks(data.footer_custom_links);
            }
        };
        fetchFooterLinks();
    }, [tenant?.id]);

    if (!tenant) return null;

    const config = tenant.config || {};
    const offices = config.offices || [];
    const social = config.social_media || {};

    const getLocalized = (link: any, field: 'title' | 'content') => {
        const lang = i18n.language.split('-')[0];
        // 1. Check AI Translations object
        if (link.translations?.[lang]?.[field]) return link.translations[lang][field];
        // 2. Check localized fields if they exist as objects
        if (typeof link[field] === 'object' && link[field]?.[lang]) return link[field][lang];
        // 3. Fallback to Spanish translations
        if (link.translations?.es?.[field]) return link.translations.es[field];
        // 4. Fallback to raw field (if it's a string)
        return typeof link[field] === 'string' ? link[field] : (link[field]?.es || '');
    };

    const servicesLinks = footerLinks.filter(l => l.section === 'services');
    const legalLinks = footerLinks.filter(l => l.section === 'legal');

    const finalServices = servicesLinks;
    const finalLegal = legalLinks.length > 0 ? legalLinks : [
        { id: 'privacy', title: t('footer.links.privacy_policy'), url: 'privacy', isLegal: true },
        { id: 'cookies', title: t('footer.links.cookie_policy'), url: 'cookies', isLegal: true },
        { id: 'legal', title: t('footer.links.legal_notice'), url: 'legal', isLegal: true }
    ];

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
                            {config.description || t('tenant_page.hero_desc')}
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                            {config.partner_logo_url && (
                                <a href={config.partner_url || '#'} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.partner_logo_url} className="h-8 object-contain" alt="Partner" />
                                </a>
                            )}
                            {config.iso_logo_url && (
                                <a href={config.extra_url || '#'} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.iso_logo_url} className="h-12 object-contain" alt="ISO" />
                                </a>
                            )}
                            {config.extra_logo_url && (
                                <div className="opacity-40 hover:opacity-100 transition-opacity">
                                    <img src={config.extra_logo_url} className="h-8 object-contain" alt="Logo Extra" />
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('footer.sections.services')}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {finalServices.map((link: any) => {
                                const Icon = IconMap[link.icon] || FileText;
                                return (
                                    <li key={link.id}>
                                        <button
                                            onClick={() => {
                                                if (link.isAction) onOpenService?.(link.url);
                                                else setActiveModal(link);
                                            }}
                                            className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                        >
                                            <Icon size={16} className="text-primary/40 group-hover:text-primary" />
                                            {link.isAction ? link.title : getLocalized(link, 'title')}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Columna 3: Legal */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('footer.sections.legal')}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {finalLegal.map((link: any) => {
                                const Icon = IconMap[link.icon] || ShieldCheck;
                                return (
                                    <li key={link.id}>
                                        <button
                                            onClick={() => {
                                                if (link.isLegal) onOpenLegal?.(link.url as any);
                                                else setActiveModal(link);
                                            }}
                                            className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                                        >
                                            <Icon size={16} className="text-primary/40 group-hover:text-primary" />
                                            {link.isLegal ? link.title : getLocalized(link, 'title')}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Columna 4: Contacto */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('footer.sections.contact')}</h4>
                        <div className="space-y-6">
                            {/* Sedes */}
                            {offices.map((office: any, idx: number) => (
                                office.label && office.address && (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                            <Globe size={18} />
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

                            {/* Social Media */}
                            <div className="flex items-center gap-3 pt-6 border-t border-white/5">
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
                    </div>

                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} {tenant.name} • {t('footer.rights')}
                    </p>
                </div>
            </div>

            {/* Modal para Enlaces Personalizados */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/80 animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
                        {/* Header del Modal */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                    {(() => {
                                        const Icon = IconMap[activeModal.icon] || Info;
                                        return <Icon size={24} />;
                                    })()}
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                                    {getLocalized(activeModal, 'title')}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-3 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                {getLocalized(activeModal, 'content')}
                            </div>
                        </div>

                        {/* Footer del Modal */}
                        <div className="p-8 pt-4 flex justify-end">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-8 py-3 bg-primary text-slate-900 font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};
