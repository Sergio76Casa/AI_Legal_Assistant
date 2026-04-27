/**
 * signatureService.ts — Servicio centralizado de solicitudes de firma digital
 *
 * Lógica pura sin dependencias de React. Puede ser consumida por cualquier
 * hook o función del proyecto (useSignatureRequests, useSignatureModal, etc.).
 *
 * Flujo de createSignatureRequest:
 *  1. Recupera la storage_path del PDF base en la plantilla.
 *  2. Descarga el PDF del bucket 'templates'.
 *  3. Archiva una copia inmutable en el bucket 'signatures' con path único.
 *  4. Inserta la solicitud en 'document_signature_requests'.
 *  5. Devuelve la solicitud creada o lanza un error tipado.
 */

import { supabase } from '../lib/supabase';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface CreateSignatureRequestParams {
    tenantId:       string;
    templateId:     string;
    templateName:   string;
    clientUserId:   string;
    requestedById:  string;
}

export interface CreatedSignatureRequest {
    id:                    string;
    access_token:          string;
    document_name:         string;
    document_storage_path: string;
    status:                'pending';
    created_at:            string;
    expires_at:            string;
}

export class SignatureServiceError extends Error {
    constructor(
        message: string,
        public readonly code: 'NOT_AUTHENTICATED' | 'TEMPLATE_NOT_FOUND' | 'DOWNLOAD_FAILED' | 'UPLOAD_FAILED' | 'INSERT_FAILED'
    ) {
        super(message);
        this.name = 'SignatureServiceError';
    }
}

// ─── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Crea una solicitud de firma completa:
 * archiva el PDF base y genera el registro en la base de datos.
 */
export async function createSignatureRequest(
    params: CreateSignatureRequestParams
): Promise<CreatedSignatureRequest> {
    const { tenantId, templateId, templateName, clientUserId, requestedById } = params;

    // 1. Obtener la ruta del PDF en el bucket de plantillas
    const { data: template, error: tErr } = await supabase
        .from('pdf_templates')
        .select('storage_path')
        .eq('id', templateId)
        .single();

    if (tErr || !template?.storage_path) {
        throw new SignatureServiceError(
            'No se pudo encontrar el archivo base de la plantilla.',
            'TEMPLATE_NOT_FOUND'
        );
    }

    // 2. Descargar PDF base del bucket 'templates'
    const { data: pdfBlob, error: dlErr } = await supabase.storage
        .from('templates')
        .download(template.storage_path);

    if (dlErr || !pdfBlob) {
        throw new SignatureServiceError(
            'Error al descargar la plantilla base para su archivo.',
            'DOWNLOAD_FAILED'
        );
    }

    // 3. Archivar copia inmutable en bucket 'signatures'
    //    Path: tenantId/templateId/{timestamp}_base.pdf
    const storagePath = `${tenantId}/${templateId}/${Date.now()}_base.pdf`;

    const { error: upErr } = await supabase.storage
        .from('signatures')
        .upload(storagePath, pdfBlob, {
            contentType: 'application/pdf',
            cacheControl: '3600',
        });

    if (upErr) {
        throw new SignatureServiceError(
            'Error al archivar el documento para la firma.',
            'UPLOAD_FAILED'
        );
    }

    // 4. Insertar solicitud en la base de datos
    const { data: newRequest, error: insertError } = await supabase
        .from('document_signature_requests')
        .insert({
            tenant_id:             tenantId,
            template_id:           templateId,
            client_user_id:        clientUserId,
            requested_by:          requestedById,
            document_name:         templateName,
            document_storage_path: storagePath,
            status:                'pending',
        })
        .select()
        .single();

    if (insertError || !newRequest) {
        throw new SignatureServiceError(
            insertError?.message ?? 'Error inesperado al crear la solicitud.',
            'INSERT_FAILED'
        );
    }

    return newRequest as CreatedSignatureRequest;
}

/**
 * Genera una URL firmada temporal (60 s) para acceder a un documento
 * firmado en el bucket protegido 'signatures'.
 */
export async function getSignedDocumentUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from('signatures')
        .createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
        throw new Error('No se pudo generar la URL de acceso al documento.');
    }

    return data.signedUrl;
}

/**
 * Determina el estado efectivo de una solicitud,
 * teniendo en cuenta si ha caducado aunque figure como 'pending'.
 */
export function resolveRequestStatus(
    status: string,
    expiresAt: string
): 'pending' | 'signed' | 'expired' {
    if (status === 'signed') return 'signed';
    if (status === 'pending' && new Date(expiresAt) < new Date()) return 'expired';
    return status as 'pending' | 'expired';
}

/**
 * Construye el mensaje de WhatsApp preformateado para compartir un enlace de firma.
 */
export function buildWhatsAppMessage(params: {
    clientName: string;
    documentName: string;
    accessToken: string;
}): string {
    const { clientName, documentName, accessToken } = params;
    const url = `${window.location.origin}/sign/${accessToken}`;
    return encodeURIComponent(
        `Hola ${clientName}, necesito tu firma digital en el documento "${documentName}". ` +
        `Puedes firmarlo directamente desde tu móvil aquí:\n\n${url}\n\n` +
        `El enlace es seguro y expira en 7 días. Gracias.`
    );
}
