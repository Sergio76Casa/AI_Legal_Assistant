import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../lib/TenantContext';
import { supabase } from '../lib/supabase';

export const useFooterLogic = (propTenant?: any) => {
    const { t, i18n } = useTranslation();
    const { tenant: contextTenant } = useTenant();
    const tenant = propTenant || contextTenant;

    const [footerLinks, setFooterLinks] = useState<any[]>([]);
    const [activeModal, setActiveModal] = useState<any | null>(null);

    useEffect(() => {
        if (!tenant?.id) return;
        supabase
            .from('organization_settings')
            .select('footer_custom_links')
            .eq('tenant_id', tenant.id)
            .single()
            .then(({ data }) => {
                if (data?.footer_custom_links) setFooterLinks(data.footer_custom_links);
            });
    }, [tenant?.id]);

    const getLocalized = (link: any, field: 'title' | 'content'): string => {
        const lang = i18n.language.split('-')[0];
        if (link.translations?.[lang]?.[field]) return link.translations[lang][field];
        if (typeof link[field] === 'object' && link[field]?.[lang]) return link[field][lang];
        if (link.translations?.en?.[field]) return link.translations.en[field];
        if (link.translations?.es?.[field]) return link.translations.es[field];
        const raw = typeof link[field] === 'string' ? link[field] : (link[field]?.es || '');
        return raw || (field === 'title' ? link.title || 'Untitled' : '');
    };

    const config   = tenant?.config || {};
    const offices  = config.offices       || [];
    const social   = config.social_media  || {};

    const legalLinks    = footerLinks.filter(l => l.section === 'legal');
    const finalServices = footerLinks.filter(l => l.section === 'services');
    const finalLegal    = legalLinks.length > 0 ? legalLinks : [
        { id: 'privacy', title: t('footer.links.privacy_policy'), url: 'privacy', isLegal: true },
        { id: 'cookies', title: t('footer.links.cookie_policy'),  url: 'cookies', isLegal: true },
        { id: 'legal',   title: t('footer.links.legal_notice'),   url: 'legal',   isLegal: true },
    ];

    return { tenant, config, offices, social, activeModal, setActiveModal, getLocalized, finalServices, finalLegal };
};
