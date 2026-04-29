import React from 'react';
import {
    FileText, ShieldCheck, Globe, Building,
    HelpCircle, Info, Scale, Scroll, FileDigit,
    Briefcase, MessageSquare, Zap, type LucideIcon,
} from 'lucide-react';

export const IconMap: Record<string, LucideIcon> = {
    FileText, ShieldCheck, Globe, Building,
    HelpCircle, Info, Scale, Scroll, FileDigit,
    Briefcase, MessageSquare, Zap,
};

interface FooterLinkColumnProps {
    title: string;
    links: any[];
    defaultIconName: string;
    onLinkClick: (link: any) => void;
    getLocalized: (link: any, field: 'title' | 'content') => string;
}

export const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({
    title, links, defaultIconName, onLinkClick, getLocalized,
}) => {
    const DefaultIcon = IconMap[defaultIconName] ?? FileText;
    return (
        <div className="space-y-6">
            <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{title}</h4>
            <ul className="space-y-4 text-sm font-medium">
                {links.map((link: any) => {
                    const Icon = IconMap[link.icon] ?? DefaultIcon;
                    const label = (link.isLegal || link.isAction) ? link.title : getLocalized(link, 'title');
                    return (
                        <li key={link.id}>
                            <button
                                onClick={() => onLinkClick(link)}
                                className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all group w-full text-left"
                            >
                                <Icon size={16} className="text-primary/40 group-hover:text-primary" />
                                {label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
