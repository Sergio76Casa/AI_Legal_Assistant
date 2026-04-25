import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type SigningState = 'loading' | 'missing_data' | 'ready' | 'signing' | 'processing' | 'preview_certificate' | 'success' | 'already_signed' | 'expired' | 'error';

export interface SignatureRequest {
    id: string;
    tenant_id: string;
    template_id: string;
    client_user_id: string;
    requested_by: string;
    status: 'pending' | 'signed' | 'expired' | 'cancelled';
    document_storage_path: string;
    signed_document_path: string | null;
    access_token: string;
    document_name: string;
    expires_at: string;
    signed_at: string | null;
    created_at: string;
}

export interface TenantInfo {
    id: string;
    name: string;
    slug: string;
    config: any;
}

export const useSignatureFlow = (documentId: string) => {
    const [state, setState] = useState<SigningState>('loading');
    const [request, setRequest] = useState<SignatureRequest | null>(null);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [fieldMappings, setFieldMappings] = useState<any[]>([]);
    const [missingFields, setMissingFields] = useState<any[]>([]);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSavingData, setIsSavingData] = useState(false);

    const loadRequest = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .rpc('get_signature_request_by_token', { p_token: documentId });

            if (error || !data) {
                setState('error');
                setErrorMessage('Documento no encontrado o enlace inválido.');
                return;
            }

            const requestData: SignatureRequest = {
                id: data.id,
                tenant_id: data.tenant_id,
                template_id: data.template_id,
                client_user_id: data.client_user_id,
                requested_by: data.requested_by,
                status: data.status,
                document_storage_path: data.document_storage_path,
                signed_document_path: data.signed_document_path,
                access_token: data.access_token,
                document_name: data.document_name,
                expires_at: data.expires_at,
                signed_at: data.signed_at,
                created_at: data.created_at,
            };

            setRequest(requestData);

            if (data.tenant_name) {
                setTenantInfo({
                    id: data.tenant_id,
                    name: data.tenant_name,
                    slug: data.tenant_slug || 'global',
                    config: data.tenant_config || {}
                });
            }

            if (data.status === 'signed') {
                setState('already_signed');
                return;
            }

            if (data.status === 'expired' || data.status === 'cancelled') {
                setState('expired');
                return;
            }

            if (new Date(data.expires_at) < new Date()) {
                setState('expired');
                await supabase.rpc('mark_signature_expired', { p_token: documentId });
                return;
            }

            if (data.document_storage_path) {
                const { data: signedUrl } = await supabase.storage
                    .from('signatures')
                    .createSignedUrl(data.document_storage_path, 3600);

                if (signedUrl?.signedUrl) {
                    setPdfPreviewUrl(signedUrl.signedUrl);
                }
            }

            const { data: mappings } = await supabase.rpc('get_signature_template_mappings', { p_token: documentId });
            const allMappings = mappings || [];
            setFieldMappings(allMappings);

            const { data: profile } = await supabase.rpc('get_signer_profile_full', { p_token: documentId });
            const profileData = profile || {};

            if (data.status === 'pending') {
                const missing = allMappings.filter((m: any) => {
                    const systemFields = ['today_date', 'client_signature', 'today_day', 'today_month', 'today_year'];
                    if (systemFields.includes(m.field_key)) return false;
                    if (m.field_type === 'signature') return false;

                    let val = profileData[m.field_key];
                    if (val === null || val === undefined || String(val).trim() === '') {
                        if (m.field_key === 'first_name') val = profileData['full_name'];
                        if (m.field_key === 'full_name') val = profileData['first_name'];
                    }

                    return val === null || val === undefined || String(val).trim() === '';
                });

                if (missing.length > 0) {
                    setMissingFields(missing);
                    setState('missing_data');
                    return;
                }
            }

            setState('ready');
        } catch (err) {
            console.error('Error loading signature request:', err);
            setState('error');
            setErrorMessage('Error al cargar la solicitud de firma.');
        }
    }, [documentId]);

    useEffect(() => {
        loadRequest();
    }, [loadRequest]);

    const handleDataSubmit = async (formData: any) => {
        setIsSavingData(true);
        try {
            const { error } = await supabase.rpc('update_signer_data_by_token', {
                p_token: documentId,
                p_updates: formData
            });

            if (error) throw error;
            await loadRequest();
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error al guardar los datos.');
        } finally {
            setIsSavingData(false);
        }
    };

    return {
        state,
        setState,
        request,
        setRequest,
        tenantInfo,
        fieldMappings,
        missingFields,
        pdfPreviewUrl,
        errorMessage,
        isSavingData,
        handleDataSubmit
    };
};
