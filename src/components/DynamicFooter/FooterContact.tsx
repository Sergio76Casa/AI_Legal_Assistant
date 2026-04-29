import React from 'react';
import { Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterContactProps {
    config: any;
    offices: any[];
    social: Record<string, string>;
}

const socialIcon = 'w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition-all';

export const FooterContact: React.FC<FooterContactProps> = ({ config, offices, social }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('footer.sections.contact')}</h4>
            <div className="space-y-6">

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

                <div className="space-y-4 pt-4 border-t border-white/5">
                    {config.contact_phone && (
                        <a href={`tel:${config.contact_phone}`} className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group">
                            <span className="text-primary/40 group-hover:text-primary"><Phone size={18} /></span>
                            <span className="text-sm font-bold tracking-tight">{config.contact_phone}</span>
                        </a>
                    )}
                    {config.contact_email && (
                        <a href={`mailto:${config.contact_email}`} className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group">
                            <span className="text-primary/40 group-hover:text-primary"><Mail size={18} /></span>
                            <span className="text-sm font-bold tracking-tight">{config.contact_email}</span>
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                    {social.facebook  && <a href={social.facebook}  target="_blank" rel="noopener noreferrer" className={socialIcon}><Facebook  size={16} /></a>}
                    {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={socialIcon}><Instagram size={16} /></a>}
                    {social.twitter   && <a href={social.twitter}   target="_blank" rel="noopener noreferrer" className={socialIcon}><Twitter   size={16} /></a>}
                    {social.linkedin  && <a href={social.linkedin}  target="_blank" rel="noopener noreferrer" className={socialIcon}><Linkedin  size={16} /></a>}
                </div>
            </div>
        </div>
    );
};
