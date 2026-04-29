import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import { useTranslation } from 'react-i18next';

export type ProfileTab = 'basic' | 'address' | 'filiation' | 'representation';

export interface ProfileFormData {
    first_name: string;
    last_name: string;
    second_last_name: string;
    nie: string;
    passport_num: string;
    sex: string;
    civil_status: string;
    phone: string;
    email: string;
    address: string;
    address_street: string;
    address_number: string;
    address_floor: string;
    city: string;
    postal_code: string;
    address_province: string;
    nationality: string;
    birth_date: string;
    father_name: string;
    mother_name: string;
    representative_name: string;
    representative_nie: string;
}

const INITIAL_FORM: ProfileFormData = {
    first_name: '', last_name: '', second_last_name: '', nie: '', passport_num: '',
    sex: '', civil_status: '', phone: '', email: '', address: '', address_street: '',
    address_number: '', address_floor: '', city: '', postal_code: '', address_province: '',
    nationality: '', birth_date: '', father_name: '', mother_name: '',
    representative_name: '', representative_nie: '',
};

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

interface Params {
    isOpen: boolean;
    userId: string;
    onClose: () => void;
    onProfileUpdated?: () => void;
}

export const useEditProfileLogic = ({ isOpen, userId, onClose, onProfileUpdated }: Params) => {
    const { t } = useTranslation();
    const { tenant, profile, loading: tenantLoading } = useTenant();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
    const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM);

    const isSuperAdmin = profile?.role === 'superadmin' || tenant?.id === NIL_UUID;

    useEffect(() => {
        if (isOpen && userId && !tenantLoading) fetchProfile();
    }, [isOpen, userId, tenantLoading, tenant?.id, profile?.role]);

    const fetchProfile = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            let query = supabase.from('profiles').select('*').eq('id', userId);
            if (!isSuperAdmin && tenant?.id) query = query.eq('tenant_id', tenant.id);

            const { data, error } = await query.maybeSingle();
            if (error) console.error('[EditProfileModal] Error fetching profile:', error);
            if (data) {
                setFormData({
                    first_name:          data.first_name          || '',
                    last_name:           data.last_name           || '',
                    second_last_name:    data.second_last_name    || '',
                    nie:                 data.nie                 || '',
                    passport_num:        data.passport_num        || '',
                    sex:                 data.sex                 || '',
                    civil_status:        data.civil_status        || '',
                    phone:               data.phone               || '',
                    email:               data.email               || '',
                    address:             data.address             || '',
                    address_street:      data.address_street      || '',
                    address_number:      data.address_number      || '',
                    address_floor:       data.address_floor       || '',
                    city:                data.city                || '',
                    postal_code:         data.postal_code         || '',
                    address_province:    data.address_province    || '',
                    nationality:         data.nationality         || '',
                    birth_date:          data.birth_date          || '',
                    father_name:         data.father_name         || '',
                    mother_name:         data.mother_name         || '',
                    representative_name: data.representative_name || '',
                    representative_nie:  data.representative_nie  || '',
                });
            } else {
                console.warn(`[EditProfileModal] No profile found for ID: ${userId}`);
            }
        } catch (err) {
            console.error('[EditProfileModal] Fatal error in fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, birth_date: formData.birth_date || null };
            let query = supabase.from('profiles').update(payload).eq('id', userId);
            if (!isSuperAdmin && tenant?.id) query = query.eq('tenant_id', tenant.id);
            const { error } = await query;
            if (error) throw error;
            onProfileUpdated?.();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(t('profile.save_error'));
        } finally {
            setSaving(false);
        }
    };

    return { loading, saving, activeTab, setActiveTab, formData, handleChange, handleSubmit };
};
