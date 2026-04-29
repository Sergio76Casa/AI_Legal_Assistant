import React from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import type { ProfileTab, ProfileFormData } from '../../hooks/useEditProfileLogic';

interface ProfileFormFieldsProps {
    activeTab: ProfileTab;
    formData: ProfileFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    userId: string;
}

const FormInput = ({
    label, name, value, onChange, type = 'text', placeholder = '', readOnly = false, className = '',
}: {
    label: string; name: string; value: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string; placeholder?: string; readOnly?: boolean; className?: string;
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
            className={cn(
                'px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all bg-white/5 text-white placeholder-slate-500',
                readOnly && 'cursor-default select-all',
                className
            )}
        />
    </div>
);

const selectClass = 'px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white/5 text-white';

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({ activeTab, formData, onChange, userId }) => {
    const { t } = useTranslation();

    if (activeTab === 'basic') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <FormInput label={t('fields.user_id')} name="user_id" value={userId} readOnly className="font-mono bg-white/[0.02] border-white/5 text-slate-400" />
            </div>
            <FormInput label={t('fields.first_name')}       name="first_name"       value={formData.first_name}       onChange={onChange} />
            <FormInput label={t('fields.last_name')}        name="last_name"        value={formData.last_name}        onChange={onChange} />
            <FormInput label={t('fields.second_last_name')} name="second_last_name" value={formData.second_last_name} onChange={onChange} />
            <FormInput label={t('fields.nie')}              name="nie"              value={formData.nie}              onChange={onChange} />
            <FormInput label={t('fields.passport_num')}     name="passport_num"     value={formData.passport_num}     onChange={onChange} />
            <FormInput label={t('fields.nationality')}      name="nationality"      value={formData.nationality}      onChange={onChange} />
            <FormInput label={t('fields.birth_date')}       name="birth_date"       value={formData.birth_date}       onChange={onChange} type="date" />
            <FormInput label={t('fields.phone')}            name="phone"            value={formData.phone}            onChange={onChange} />

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">{t('profile.sex')}</label>
                <select name="sex" value={formData.sex} onChange={onChange} className={selectClass}>
                    <option value="">{t('profile.select')}</option>
                    <option value="male">{t('fields.sex_male')}</option>
                    <option value="female">{t('fields.sex_female')}</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">{t('civil_status')}</label>
                <select name="civil_status" value={formData.civil_status} onChange={onChange} className={selectClass}>
                    <option value="">{t('profile.select')}</option>
                    <option value="S">{t('profile.civil_status_s')}</option>
                    <option value="C">{t('profile.civil_status_c')}</option>
                    <option value="V">{t('profile.civil_status_v')}</option>
                    <option value="D">{t('profile.civil_status_d')}</option>
                    <option value="Sp">{t('profile.civil_status_sp')}</option>
                </select>
            </div>
        </div>
    );

    if (activeTab === 'address') return (
        <div className="space-y-4">
            <FormInput label={t('fields.address')} name="address" value={formData.address} onChange={onChange} placeholder={t('profile.placeholders.address')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-2">
                <span className="col-span-full text-xs font-bold text-slate-500 uppercase tracking-wider mb-[-10px]">
                    {t('profile.address_breakdown')}
                </span>
                <div className="md:col-span-2">
                    <FormInput label={t('fields.address_street')} name="address_street" value={formData.address_street} onChange={onChange} placeholder={t('profile.placeholders.street')} />
                </div>
                <FormInput label={t('fields.address_number')}   name="address_number"   value={formData.address_number}   onChange={onChange} />
                <FormInput label={t('fields.address_floor')}    name="address_floor"    value={formData.address_floor}    onChange={onChange} />
                <FormInput label={t('fields.postal_code')}      name="postal_code"      value={formData.postal_code}      onChange={onChange} />
                <FormInput label={t('fields.city')}             name="city"             value={formData.city}             onChange={onChange} />
                <FormInput label={t('fields.address_province')} name="address_province" value={formData.address_province} onChange={onChange} />
            </div>
        </div>
    );

    if (activeTab === 'filiation') return (
        <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-500/10 text-blue-300 text-sm rounded-lg mb-2 border border-blue-500/20">
                {t('profile.filiation_note')}
            </div>
            <FormInput label={t('fields.father_name')} name="father_name" value={formData.father_name} onChange={onChange} />
            <FormInput label={t('fields.mother_name')} name="mother_name" value={formData.mother_name} onChange={onChange} />
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-amber-500/10 text-amber-300 text-sm rounded-lg mb-2 border border-amber-500/20">
                {t('profile.rep_note')}
            </div>
            <FormInput label={t('fields.representative_name')} name="representative_name" value={formData.representative_name} onChange={onChange} />
            <FormInput label={t('fields.representative_nie')}  name="representative_nie"  value={formData.representative_nie}  onChange={onChange} />
        </div>
    );
};
