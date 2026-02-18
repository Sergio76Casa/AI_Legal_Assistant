
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, User, MapPin, Users, FileText, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onProfileUpdated?: () => void;
}

import { useTranslation } from 'react-i18next';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userId, onProfileUpdated }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'filiation' | 'representation'>('basic');

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        second_last_name: '',
        nie: '',
        passport_num: '',
        sex: '',
        civil_status: '',
        phone: '',
        email: '', // Read only usually

        address: '', // Generic
        address_street: '',
        address_number: '',
        address_floor: '',
        city: '',
        postal_code: '',
        address_province: '',
        nationality: '',
        birth_date: '',

        father_name: '',
        mother_name: '',

        representative_name: '',
        representative_nie: ''
    });

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                second_last_name: data.second_last_name || '',
                nie: data.nie || '',
                passport_num: data.passport_num || '',
                sex: data.sex || '',
                civil_status: data.civil_status || '',
                phone: data.phone || '',
                email: data.email || '',

                address: data.address || '',
                address_street: data.address_street || '',
                address_number: data.address_number || '',
                address_floor: data.address_floor || '',
                city: data.city || '',
                postal_code: data.postal_code || '',
                address_province: data.address_province || '',
                nationality: data.nationality || '',
                birth_date: data.birth_date || '',

                father_name: data.father_name || '',
                mother_name: data.mother_name || '',

                representative_name: data.representative_name || '',
                representative_nie: data.representative_nie || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Sanitize data
            const payload = {
                ...formData,
                birth_date: formData.birth_date ? formData.birth_date : null,
            };

            const { error } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', userId);

            if (error) throw error;

            if (onProfileUpdated) onProfileUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(t('profile.save_error'));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User className="text-emerald-600" size={20} />
                        {t('profile.edit_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            {[
                                { id: 'basic', label: t('profile.tabs.personal'), icon: User },
                                { id: 'address', label: t('profile.tabs.address'), icon: MapPin },
                                { id: 'filiation', label: t('profile.tabs.filiation'), icon: Users },
                                { id: 'representation', label: t('profile.tabs.representation'), icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">

                            {/* BASIC INFO */}
                            {activeTab === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label={t('fields.first_name')} name="first_name" value={formData.first_name} onChange={handleChange} />
                                    <FormInput label={t('fields.last_name')} name="last_name" value={formData.last_name} onChange={handleChange} />
                                    <FormInput label={t('fields.second_last_name')} name="second_last_name" value={formData.second_last_name} onChange={handleChange} />
                                    <FormInput label={t('fields.nie')} name="nie" value={formData.nie} onChange={handleChange} />
                                    <FormInput label={t('fields.passport_num')} name="passport_num" value={formData.passport_num} onChange={handleChange} />
                                    <FormInput label={t('fields.nationality')} name="nationality" value={formData.nationality} onChange={handleChange} />
                                    <FormInput label={t('fields.birth_date')} name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
                                    <FormInput label={t('fields.phone')} name="phone" value={formData.phone} onChange={handleChange} />

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-500">{t('profile.sex')}</label>
                                        <select
                                            name="sex"
                                            value={formData.sex}
                                            onChange={handleChange}
                                            className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                                        >
                                            <option value="">{t('profile.select')}</option>
                                            <option value="male">{t('fields.sex_male')}</option>
                                            <option value="female">{t('fields.sex_female')}</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-500">{t('civil_status')}</label>
                                        <select
                                            name="civil_status"
                                            value={formData.civil_status}
                                            onChange={handleChange}
                                            className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                                        >
                                            <option value="">{t('profile.select')}</option>
                                            <option value="S">{t('profile.civil_status_s')}</option>
                                            <option value="C">{t('profile.civil_status_c')}</option>
                                            <option value="V">{t('profile.civil_status_v')}</option>
                                            <option value="D">{t('profile.civil_status_d')}</option>
                                            <option value="Sp">{t('profile.civil_status_sp')}</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* ADDRESS */}
                            {activeTab === 'address' && (
                                <div className="space-y-4">
                                    <FormInput label={t('fields.address')} name="address" value={formData.address} onChange={handleChange} placeholder={t('profile.placeholders.address')} />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
                                        <span className="col-span-full text-xs font-bold text-slate-400 uppercase tracking-wider mb-[-10px]">{t('profile.address_breakdown')}</span>
                                        <div className="md:col-span-2">
                                            <FormInput label={t('fields.address_street')} name="address_street" value={formData.address_street} onChange={handleChange} placeholder={t('profile.placeholders.street')} />
                                        </div>
                                        <FormInput label={t('fields.address_number')} name="address_number" value={formData.address_number} onChange={handleChange} />
                                        <FormInput label={t('fields.address_floor')} name="address_floor" value={formData.address_floor} onChange={handleChange} />
                                        <FormInput label={t('fields.postal_code')} name="postal_code" value={formData.postal_code} onChange={handleChange} />
                                        <FormInput label={t('fields.city')} name="city" value={formData.city} onChange={handleChange} />
                                        <FormInput label={t('fields.address_province')} name="address_province" value={formData.address_province} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            {/* FILIATION */}
                            {activeTab === 'filiation' && (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg mb-2">
                                        {t('profile.filiation_note')}
                                    </div>
                                    <FormInput label={t('fields.father_name')} name="father_name" value={formData.father_name} onChange={handleChange} />
                                    <FormInput label={t('fields.mother_name')} name="mother_name" value={formData.mother_name} onChange={handleChange} />
                                </div>
                            )}

                            {/* REPRESENTATION */}
                            {activeTab === 'representation' && (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-lg mb-2">
                                        {t('profile.rep_note')}
                                    </div>
                                    <FormInput label={t('fields.representative_name')} name="representative_name" value={formData.representative_name} onChange={handleChange} />
                                    <FormInput label={t('fields.representative_nie')} name="representative_nie" value={formData.representative_nie} onChange={handleChange} />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                            >
                                {t('profile.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {t('profile.save_btn')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "" }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
        />
    </div>
);
