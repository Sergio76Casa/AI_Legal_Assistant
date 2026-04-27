/**
 * PDFMapper — Constantes de Campos Disponibles
 *
 * IMPORTANT: AVAILABLE_FIELDS depende de i18n (función `t`), por lo que
 * se exporta como una factory function en lugar de un array estático.
 * Úsala dentro de un useMemo: `useMemo(() => getAvailableFields(t), [t])`
 */

import type { AvailableField } from './types';
import type { TFunction } from 'i18next';

export const getAvailableFields = (t: TFunction): AvailableField[] => [
    // ─── Datos Personales ──────────────────────────────────────────────────
    { group: 'Datos Personales', key: 'first_name',        label: t('fields.first_name') },
    { group: 'Datos Personales', key: 'last_name',         label: t('fields.last_name') },
    { group: 'Datos Personales', key: 'second_last_name',  label: t('fields.second_last_name') },
    { group: 'Datos Personales', key: 'nie',               label: t('fields.nie') },
    { group: 'Datos Personales', key: 'passport_num',      label: t('fields.passport_num') },
    { group: 'Datos Personales', key: 'birth_date',        label: t('fields.birth_date') },
    { group: 'Datos Personales', key: 'birth_day',         label: t('fields.birth_day') },
    { group: 'Datos Personales', key: 'birth_month',       label: t('fields.birth_month') },
    { group: 'Datos Personales', key: 'birth_year',        label: t('fields.birth_year') },
    { group: 'Datos Personales', key: 'birth_place',       label: t('fields.birth_place') },
    { group: 'Datos Personales', key: 'birth_country',     label: t('fields.birth_country') },
    { group: 'Datos Personales', key: 'nationality',       label: t('fields.nationality') },
    { group: 'Datos Personales', key: 'sex',               label: t('fields.sex') },
    { group: 'Datos Personales', key: 'sex_male',          label: t('fields.sex_male') },
    { group: 'Datos Personales', key: 'sex_female',        label: t('fields.sex_female') },
    { group: 'Datos Personales', key: 'sex_x',             label: t('fields.sex_x') },
    { group: 'Datos Personales', key: 'civil_status',      label: t('fields.civil_status') },

    // ─── Filiación ─────────────────────────────────────────────────────────
    { group: 'Filiación', key: 'father_name', label: t('fields.father_name') },
    { group: 'Filiación', key: 'mother_name', label: t('fields.mother_name') },

    // ─── Contacto y Dirección ──────────────────────────────────────────────
    { group: 'Contacto y Dirección', key: 'email',            label: t('fields.email') },
    { group: 'Contacto y Dirección', key: 'phone',            label: t('fields.phone') },
    { group: 'Contacto y Dirección', key: 'address',          label: t('fields.address') },
    { group: 'Contacto y Dirección', key: 'address_street',   label: t('fields.address_street') },
    { group: 'Contacto y Dirección', key: 'address_number',   label: t('fields.address_number') },
    { group: 'Contacto y Dirección', key: 'address_floor',    label: t('fields.address_floor') },
    { group: 'Contacto y Dirección', key: 'city',             label: t('fields.city') },
    { group: 'Contacto y Dirección', key: 'postal_code',      label: t('fields.postal_code') },
    { group: 'Contacto y Dirección', key: 'address_province', label: t('fields.address_province') },

    // ─── Representación ────────────────────────────────────────────────────
    { group: 'Representación', key: 'representative_name', label: t('fields.representative_name') },
    { group: 'Representación', key: 'representative_nie',  label: t('fields.representative_nie') },

    // ─── Sistema ───────────────────────────────────────────────────────────
    { group: 'Sistema', key: 'today_date',  label: t('fields.today_date') },
    { group: 'Sistema', key: 'today_day',   label: t('fields.today_day') },
    { group: 'Sistema', key: 'today_month', label: t('fields.today_month') },
    { group: 'Sistema', key: 'today_year',  label: t('fields.today_year') },

    // ─── Acciones ──────────────────────────────────────────────────────────
    { group: 'Acciones', key: 'client_signature', label: 'Firma del Cliente' },
];
