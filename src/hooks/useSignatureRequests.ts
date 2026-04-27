/**
 * useSignatureRequests — Hook central del gestor de firmas digitales
 *
 * Gestiona: carga de solicitudes (JOIN optimizado), carga de usuarios,
 * creación de solicitudes (con copia de PDF a bucket firmas) y acceso
 * a documentos firmados.
 *
 * Optimización N+1: Sustituye el enrichment manual con Promise.all
 * por un JOIN nativo de Supabase en una sola round-trip a la DB.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../lib/TenantContext';
import {
    createSignatureRequest,
    getSignedDocumentUrl,
    SignatureServiceError,
} from '../services/signatureService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SignatureRequest {
    id: string;
    document_name: string;
    client_user_id: string;
    status: 'pending' | 'signed' | 'expired';
    access_token: string;
    created_at: string;
    signed_at: string | null;
    expires_at: string;
    document_storage_path?: string;
    signed_document_path?: string;
    /** Perfil enriquecido vía JOIN de PostgREST */
    client_profile?: {
        full_name: string | null;
        username: string | null;
    };
}

export interface ClientUser {
    id: string;
    full_name: string | null;
    username: string | null;
}

interface UseSignatureRequestsOptions {
    templateId: string;
    templateName: string;
    tenantId: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// IMPORTANTE: el nil UUID es el tenant_id REAL del superadmin.
// La guardia solo bloquea IDs virtuales ('personal') y strings vacíos.
// La pausa real se gestiona con tenantLoading del contexto.
const isRealTenant = (id: string) => !!id && id !== 'personal';

export function useSignatureRequests({ templateId, templateName, tenantId }: UseSignatureRequestsOptions) {

    const { loading: tenantLoading } = useTenant();

    const [requests,        setRequests]       = useState<SignatureRequest[]>([]);
    const [users,           setUsers]          = useState<ClientUser[]>([]);
    const [loading,         setLoading]        = useState(true);
    const [sending,         setSending]        = useState(false);
    const [error,           setError]          = useState<string | null>(null);
    const [success,         setSuccess]        = useState<string | null>(null);
    const [selectedUserId,  setSelectedUserId] = useState('');

    const isFetching = useRef(false);

    // useEffect solo depende de primitivos. Las funciones (loadRequests, loadUsers)
    // NO están en deps para evitar el bucle por regeneración de useCallback.
    useEffect(() => {
        if (tenantLoading || !isRealTenant(tenantId)) {
            setLoading(false);
            return;
        }
        loadRequests();
        loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, templateId, tenantLoading]);

    // ─── Carga de solicitudes con JOIN optimizado ──────────────────────────
    const loadRequests = useCallback(async () => {
        if (!isRealTenant(tenantId) || isFetching.current) return;
        isFetching.current = true;
        setLoading(true);

        const NIL_UUID = '00000000-0000-0000-0000-000000000000';
        const isSuperAdmin = tenantId === NIL_UUID;

        try {
            let query = supabase
                .from('document_signature_requests')
                .select('*, client_profile:profiles!client_user_id(full_name, username)')
                .order('created_at', { ascending: false });

            // Superadmin ve todas las solicitudes; admin normal solo las de su tenant
            if (!isSuperAdmin) {
                query = query.eq('tenant_id', tenantId);
            }
            if (templateId !== 'ALL') {
                query = query.eq('template_id', templateId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.warn('[useSignatureRequests] JOIN falló, cargando sin perfiles:', fetchError.message);
                let fallbackQuery = supabase
                    .from('document_signature_requests')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!isSuperAdmin) fallbackQuery = fallbackQuery.eq('tenant_id', tenantId);
                const { data: fallback } = await fallbackQuery;
                setRequests((fallback ?? []) as SignatureRequest[]);
            } else {
                setRequests((data ?? []) as SignatureRequest[]);
            }
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [tenantId, templateId]);

    // ─── Carga de usuarios disponibles para asignar firma ─────────────────
    const loadUsers = useCallback(async () => {
        if (!isRealTenant(tenantId)) return;

        const NIL_UUID = '00000000-0000-0000-0000-000000000000';

        // Superadmin (nil UUID): omite el filtro tenant_id para ver todos los clientes.
        // Admin normal: filtra por su propio tenant_id.
        let query = supabase
            .from('profiles')
            .select('id, full_name, username')
            .eq('role', 'user');

        if (tenantId !== NIL_UUID) {
            query = query.eq('tenant_id', tenantId);
        }

        const { data } = await query;
        if (data) setUsers(data as ClientUser[]);
    }, [tenantId]);

    // ─── Crear solicitud de firma (delegado a signatureService) ───────────
    const handleCreateRequest = useCallback(async () => {
        if (!tenantId || !selectedUserId) return;

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new SignatureServiceError('No autenticado', 'NOT_AUTHENTICATED');

            // Verificación defensiva: usa el tenant_id del perfil real del admin,
            // no el prop recibido, para que coincida con la policy RLS de Supabase.
            const { data: adminProfile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single();

            const effectiveTenantId = adminProfile?.tenant_id ?? tenantId;

            const newRequest = await createSignatureRequest({
                tenantId:      effectiveTenantId,
                templateId,
                templateName,
                clientUserId:  selectedUserId,
                requestedById: user.id,
            });

            const signUrl = `${window.location.origin}/sign/${newRequest.access_token}`;
            setSuccess(`¡Solicitud creada! Enlace: ${signUrl}`);
            setSelectedUserId('');
            await loadRequests();

        } catch (err: unknown) {
            console.error('[useSignatureRequests] createRequest error:', err);
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
    }, [tenantId, selectedUserId, templateId, templateName, loadRequests]);

    // ─── Abrir documento firmado (delegado a signatureService) ───────────
    const handleViewFile = useCallback(async (path: string) => {
        try {
            const signedUrl = await getSignedDocumentUrl(path);
            window.open(signedUrl, '_blank');
        } catch (err: any) {
            alert('Error al acceder al archivo: ' + err.message);
        }
    }, []);

    // ─── API Pública ──────────────────────────────────────────────────────
    return {
        // Estado
        requests, users, loading, sending, error, success, selectedUserId,
        // Setters para el formulario
        setSelectedUserId, setError, setSuccess,
        // Acciones
        loadRequests, handleCreateRequest, handleViewFile,
    };
}
