import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import {
    createSignatureRequest,
    getSignedDocumentUrl,
    SignatureServiceError,
} from '../services/signatureService';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface ModalTemplate {
    id:       string;
    name:     string;
    category: string;
}

export interface ModalSignatureRequest {
    id:                   string;
    document_name:        string;
    template_id:          string;
    status:               string;
    access_token:         string;
    created_at:           string;
    signed_at:            string | null;
    expires_at:           string;
    signed_document_path: string | null;
}

interface UseSignatureModalOptions {
    isOpen:     boolean;
    tenantId:   string;
    clientId:   string;
    clientName: string;
}

// IMPORTANTE: el nil UUID es el tenant_id REAL del superadmin.
// Solo bloqueamos 'personal' (ID virtual) y strings vacíos.
// La pausa se gestiona con tenantLoading del contexto.
const isValidTenant = (id: string | undefined): id is string =>
    !!id && id !== 'personal';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSignatureModal({
    isOpen,
    tenantId,
    clientId,
    clientName,
}: UseSignatureModalOptions) {

    // `loading` del contexto indica que el tenant aún no se ha resuelto.
    // Sin esta guardia, las queries se disparan con 'personal' (virtual fallback)
    // y devuelven vacío, aunque luego el ID real esté disponible.
    const { tenant, loading: tenantLoading } = useTenant();

    // Prioridad: prop explícito válido > contexto. Evita que el nil UUID del
    // superadmin (o el ID virtual 'personal') pise el UUID real pasado por el padre.
    const effectiveTenantId = isValidTenant(tenantId)
        ? tenantId
        : (tenant?.id ?? '');

    const [templates,          setTemplates]          = useState<ModalTemplate[]>([]);
    const [existingRequests,   setExistingRequests]   = useState<ModalSignatureRequest[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [loading,            setLoading]            = useState(true);
    const [sending,            setSending]            = useState(false);
    const [error,              setError]              = useState<string | null>(null);
    const [success,            setSuccess]            = useState<string | null>(null);

    // Ref para evitar llamadas concurrentes (cut infinite loop)
    const isFetching = useRef(false);

    // ─── Carga paralela de plantillas y solicitudes ────────────────────────
    const loadData = useCallback(async () => {
        if (isFetching.current) return;   // guard: ya hay un fetch en curso
        if (!isValidTenant(effectiveTenantId) || !clientId) return;

        isFetching.current = true;
        setLoading(true);
        setError(null);

        try {
            const [tplResult, reqResult] = await Promise.all([
                supabase
                    .from('pdf_templates')
                    .select('id, name, category')
                    .eq('tenant_id', effectiveTenantId)
                    .order('name'),
                supabase
                    .from('document_signature_requests')
                    .select('id, document_name, template_id, status, access_token, created_at, signed_at, expires_at, signed_document_path')
                    .eq('tenant_id', effectiveTenantId)
                    .eq('client_user_id', clientId)
                    .order('created_at', { ascending: false }),
            ]);

            if (tplResult.data)  setTemplates(tplResult.data as ModalTemplate[]);
            if (reqResult.data)  setExistingRequests(reqResult.data as ModalSignatureRequest[]);
            if (tplResult.error) console.warn('[useSignatureModal] templates:', tplResult.error.message);
            if (reqResult.error) console.warn('[useSignatureModal] requests:',  reqResult.error.message);
        } catch (err) {
            console.error('[useSignatureModal] loadData error:', err);
            setError('Error al cargar los datos del modal.');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveTenantId, clientId]);

    // Solo se dispara cuando cambian datos primitivos estables.
    // loadData NO está en deps para evitar el bucle causado por la regeneración
    // del useCallback cuando effectiveTenantId cambia.
    useEffect(() => {
        if (!isOpen || !clientId || tenantLoading) return;
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, clientId, tenantLoading, effectiveTenantId]);

    // ─── Crear solicitud de firma ─────────────────────────────────────────
    const handleCreateRequest = useCallback(async () => {
        if (!selectedTemplateId || !isValidTenant(effectiveTenantId) || !clientId) return;

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new SignatureServiceError('No autenticado', 'NOT_AUTHENTICATED');

            const template = templates.find(t => t.id === selectedTemplateId);
            if (!template) throw new SignatureServiceError('Plantilla no encontrada', 'TEMPLATE_NOT_FOUND');

            await createSignatureRequest({
                tenantId:      effectiveTenantId,
                templateId:    selectedTemplateId,
                templateName:  template.name,
                clientUserId:  clientId,
                requestedById: user.id,
            });

            setSuccess('¡Solicitud creada correctamente!');
            setSelectedTemplateId('');
            await loadData();

        } catch (err: unknown) {
            console.error('[useSignatureModal] createRequest error:', err);
            setError(
                err instanceof SignatureServiceError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : 'Error inesperado al crear la solicitud.'
            );
        } finally {
            setSending(false);
        }
    }, [selectedTemplateId, effectiveTenantId, clientId, templates, loadData]);

    // ─── Ver documento firmado ────────────────────────────────────────────
    const handleDownload = useCallback(async (path: string | null) => {
        if (!path) return;
        try {
            const signedUrl = await getSignedDocumentUrl(path);
            window.open(signedUrl, '_blank');
        } catch (err: any) {
            setError('No se pudo acceder al documento: ' + err.message);
        }
    }, []);

    return {
        templates,
        existingRequests,
        selectedTemplateId,
        loading,
        sending,
        error,
        success,
        setSelectedTemplateId,
        setError,
        setSuccess,
        loadData,
        handleCreateRequest,
        handleDownload,
        clientName,
    };
}
