-- =============================================
-- Migration: Public Audit Portal RPC
-- Description: Unauthenticated access to verify document integrity
-- =============================================

-- Drops the function if it exists to allow clean recreate
DROP FUNCTION IF EXISTS public.verify_document_public(UUID);

CREATE OR REPLACE FUNCTION public.verify_document_public(p_request_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    req RECORD;
    log RECORD;
BEGIN
    -- 1. Find the request. Must be 'signed'.
    SELECT * INTO req
    FROM document_signature_requests
    WHERE id = p_request_id
      AND status = 'signed';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Documento no encontrado o no está firmado.');
    END IF;

    -- 2. Find the associated audit log (Certificate)
    SELECT * INTO log
    FROM document_signature_logs
    WHERE signature_request_id = req.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Registro de auditoría no encontrado para este documento.');
    END IF;

    -- 3. Obfuscate IP (e.g., 84.122.XX.XX)
    DECLARE
        v_ip_parts TEXT[];
        v_obfuscated_ip TEXT;
    BEGIN
        -- Basic obfuscation for IPv4
        v_ip_parts := string_to_array(log.ip_address, '.');
        IF array_length(v_ip_parts, 1) = 4 THEN
            v_obfuscated_ip := v_ip_parts[1] || '.' || v_ip_parts[2] || '.XX.XX';
        ELSE
            -- Fallback for local IPs or IPv6
            v_obfuscated_ip := '***.***.***.***';
        END IF;

        -- 4. Build success response
        SELECT json_build_object(
            'success', true,
            'document_name', req.document_name,
            'signed_at', req.signed_at,
            'signer_name', log.signer_name,
            'ip_obfuscated', v_obfuscated_ip,
            'signature_hash', log.signature_hash,
            'tenant_id', req.tenant_id
        ) INTO result;
    END;

    RETURN result;
END;
$$;

-- Grant access to anonymous users
GRANT EXECUTE ON FUNCTION public.verify_document_public(UUID) TO anon, authenticated;
