import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useTenantConfig = (tenant: any, refreshTenant: () => Promise<void>, handleTranslate: (links: any[]) => Promise<any[]>) => {
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

    // Form states
    const [identity, setIdentity] = useState({
        name: '',
        description: '',
        logo_url: '',
        partner_logo_url: '',
        partner_url: '',
        iso_logo_url: '',
        iso_url: '',
        extra_logo_url: '',
        extra_url: '',
        extra_logo_url_2: '',
        extra_url_2: '',
        show_logo: true,
        show_navbar_logo: true
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
                iso_url: config.iso_url || '',
                extra_logo_url: config.extra_logo_url || '',
                extra_url: config.extra_url || '',
                extra_logo_url_2: config.extra_logo_url_2 || '',
                extra_url_2: config.extra_url_2 || '',
                show_logo: config.show_logo !== false,
                show_navbar_logo: config.show_navbar_logo !== false
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

    const handleSave = async (silent = false) => {
        if (!tenant) return;
        if (!silent) {
            setSaving(true);
            setStatus('saving');
        }

        try {
            // 1. Translate via the provided function
            const translatedLinks = await handleTranslate(footerLinks);

            // 2. Save in tenants table
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

            // 3. Save in organization_settings
            const { error: settingsError } = await supabase
                .from('organization_settings')
                .upsert({
                    tenant_id: tenant.id,
                    footer_custom_links: translatedLinks
                }, { onConflict: 'tenant_id' });

            if (settingsError) throw settingsError;

            setFooterLinks(translatedLinks);
            await refreshTenant();

            if (!silent) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err: any) {
            console.error('Error saving config:', err);
            if (!silent) {
                alert(`No se pudo guardar: ${err.message || 'Error desconocido'}`);
                setStatus('error');
            }
        } finally {
            if (!silent) {
                setSaving(false);
                setUpdatingPlan(null);
            }
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
            console.error('Error updating plan:', err);
            alert('Error al actualizar el plan');
            setStatus('error');
        } finally {
            setUpdatingPlan(null);
        }
    };

    return {
        identity,
        setIdentity,
        contact,
        setContact,
        footerLinks,
        setFooterLinks,
        saving,
        status,
        updatingPlan,
        handleSave,
        handleUpdatePlan
    };
};
