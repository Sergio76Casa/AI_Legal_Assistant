-- =============================================
-- Migration: Public RPC Functions for Digital Signature Flow
-- These functions use SECURITY DEFINER to bypass RLS,
-- providing controlled access via access_token verification.
-- =============================================

-- ─────────────────────────────────────────────
-- 1. GET signature request by token (public access)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_signature_request_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', r.id,
        'tenant_id', r.tenant_id,
        'template_id', r.template_id,
        'client_user_id', r.client_user_id,
        'requested_by', r.requested_by,
        'status', r.status,
        'document_storage_path', r.document_storage_path,
        'signed_document_path', r.signed_document_path,
        'access_token', r.access_token,
        'document_name', r.document_name,
        'expires_at', r.expires_at,
        'signed_at', r.signed_at,
        'created_at', r.created_at,
        'tenant_name', t.name,
        'tenant_slug', t.slug,
        'tenant_config', t.config
    )
    INTO result
    FROM document_signature_requests r
    LEFT JOIN tenants t ON t.id = r.tenant_id
    WHERE r.access_token = p_token
    LIMIT 1;

    RETURN result;
END;
$$;

-- ─────────────────────────────────────────────
-- 2. GET signer profile info by user ID (limited fields)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_signer_profile(p_token TEXT, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    valid_request BOOLEAN;
BEGIN
    -- Verify token is valid and matches the user
    SELECT EXISTS(
        SELECT 1 FROM document_signature_requests
        WHERE access_token = p_token
          AND client_user_id = p_user_id
          AND status = 'pending'
    ) INTO valid_request;

    IF NOT valid_request THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'full_name', p.full_name,
        'username', p.username
    )
    INTO result
    FROM profiles p
    WHERE p.id = p_user_id;

    RETURN result;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. GET signature field mappings for a template
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_signature_fields(p_token TEXT, p_template_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    valid_request BOOLEAN;
BEGIN
    -- Verify token is valid and matches template
    SELECT EXISTS(
        SELECT 1 FROM document_signature_requests
        WHERE access_token = p_token
          AND template_id = p_template_id
          AND status = 'pending'
    ) INTO valid_request;

    IF NOT valid_request THEN
        RETURN '[]'::JSON;
    END IF;

    SELECT COALESCE(json_agg(json_build_object(
        'id', f.id,
        'page_number', f.page_number,
        'x_coordinate', f.x_coordinate,
        'y_coordinate', f.y_coordinate,
        'width', f.width,
        'height', f.height,
        'field_type', f.field_type
    )), '[]'::JSON)
    INTO result
    FROM form_fields_mapping f
    WHERE f.template_id = p_template_id
      AND f.field_type = 'signature';

    RETURN result;
END;
$$;

-- ─────────────────────────────────────────────
-- 4. COMPLETE signature: update request + create audit log
-- This is the main "sign" action - all in one transaction
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_signature(
    p_token TEXT,
    p_signed_document_path TEXT,
    p_signature_storage_path TEXT,
    p_signature_hash TEXT,
    p_signer_name TEXT,
    p_signer_email TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    req RECORD;
    result JSON;
BEGIN
    -- 1. Find and validate the request
    SELECT * INTO req
    FROM document_signature_requests
    WHERE access_token = p_token
      AND status = 'pending'
      AND expires_at > NOW()
    FOR UPDATE;  -- Lock the row to prevent race conditions

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Solicitud no encontrada, ya firmada o expirada.');
    END IF;

    -- 2. Update request status
    UPDATE document_signature_requests
    SET status = 'signed',
        signed_at = NOW(),
        signed_document_path = p_signed_document_path,
        updated_at = NOW()
    WHERE id = req.id;

    -- 3. Create audit log (Certificado de Firma)
    INSERT INTO document_signature_logs (
        signature_request_id,
        signer_user_id,
        signer_name,
        signer_email,
        ip_address,
        user_agent,
        signature_hash,
        signature_storage_path,
        signed_at
    ) VALUES (
        req.id,
        req.client_user_id,
        p_signer_name,
        p_signer_email,
        p_ip_address,
        p_user_agent,
        p_signature_hash,
        p_signature_storage_path,
        NOW()
    );

    RETURN json_build_object(
        'success', true,
        'request_id', req.id,
        'signed_at', NOW()
    );
END;
$$;

-- ─────────────────────────────────────────────
-- 5. Mark expired requests (by token)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_signature_expired(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE document_signature_requests
    SET status = 'expired', updated_at = NOW()
    WHERE access_token = p_token
      AND status = 'pending'
      AND expires_at < NOW();
END;
$$;

-- ─────────────────────────────────────────────
-- 6. Storage policies for anonymous uploads to 'signatures' bucket
-- Allow anyone with a valid path pattern to upload signatures
-- ─────────────────────────────────────────────

-- Allow anonymous INSERT (upload) to signatures bucket
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Allow anonymous signature uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow anonymous signature downloads" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Allow anonymous signature uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Allow anonymous signature downloads"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'signatures');

-- ─────────────────────────────────────────────
-- 7. Grant EXECUTE permissions to anon and authenticated roles
-- ─────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_signature_request_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_signer_profile(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_signature_fields(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_signature(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_signature_expired(TEXT) TO anon, authenticated;
