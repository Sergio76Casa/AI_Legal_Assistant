-- ====================================================================
-- SCRIPT MAESTRO DE CONSOLIDACIÓN: FLUJO DE FIRMA Y AUDITORÍA PÚBLICA
-- ====================================================================
-- INSTRUCCIONES: Ejecuta este script completo en el SQL Editor de Supabase.
-- Este script garantiza que existan todas las tablas, columnas, funciones RPC 
-- y permisos necesarios para el funcionamiento de SignaturePage.tsx.

-- --------------------------------------------------------------------
-- 1. EXTENSIÓN DE TABLA PROFILES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS second_last_name TEXT,
ADD COLUMN IF NOT EXISTS nie TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS birth_country TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS passport_num TEXT,
ADD COLUMN IF NOT EXISTS civil_status TEXT,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS address_floor TEXT,
ADD COLUMN IF NOT EXISTS address_province TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT,
ADD COLUMN IF NOT EXISTS representative_name TEXT,
ADD COLUMN IF NOT EXISTS representative_nie TEXT;

-- --------------------------------------------------------------------
-- 2. FUNCIONES RPC REQUERIDAS POR SignaturePage.tsx
-- --------------------------------------------------------------------

-- A. get_signature_request_by_token
CREATE OR REPLACE FUNCTION public.get_signature_request_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'id', sr.id,
        'tenant_id', sr.tenant_id,
        'template_id', sr.template_id,
        'client_user_id', sr.client_user_id,
        'requested_by', sr.requested_by,
        'status', sr.status,
        'document_storage_path', sr.document_storage_path,
        'signed_document_path', sr.signed_document_path,
        'access_token', sr.access_token,
        'document_name', sr.document_name,
        'expires_at', sr.expires_at,
        'signed_at', sr.signed_at,
        'created_at', sr.created_at,
        'tenant_name', t.name,
        'tenant_slug', t.slug,
        'tenant_config', t.config
    ) INTO v_result
    FROM document_signature_requests sr
    JOIN tenants t ON sr.tenant_id = t.id
    WHERE sr.access_token = p_token;

    RETURN v_result;
END;
$$;

-- B. mark_signature_expired
CREATE OR REPLACE FUNCTION public.mark_signature_expired(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE document_signature_requests
    SET status = 'expired'
    WHERE access_token = p_token
      AND status = 'pending';
END;
$$;

-- C. get_signature_template_mappings
CREATE OR REPLACE FUNCTION public.get_signature_template_mappings(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_template_id UUID;
    v_result JSON;
BEGIN
    SELECT template_id INTO v_template_id
    FROM document_signature_requests
    WHERE access_token = p_token;

    IF v_template_id IS NULL THEN
        RETURN '[]'::JSON;
    END IF;

    SELECT COALESCE(json_agg(f.*), '[]'::JSON)
    INTO v_result
    FROM (
        SELECT *
        FROM form_fields_mapping
        WHERE template_id = v_template_id
    ) f;

    RETURN v_result;
END;
$$;

-- D. get_signer_profile_full
CREATE OR REPLACE FUNCTION public.get_signer_profile_full(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    SELECT client_user_id INTO v_user_id
    FROM document_signature_requests
    WHERE access_token = p_token;

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'first_name', COALESCE(p.full_name, ''),
        'full_name', COALESCE(p.full_name, ''),
        'last_name', COALESCE(p.last_name, ''),
        'second_last_name', COALESCE(p.second_last_name, ''),
        'nie', COALESCE(p.nie, ''),
        'passport_num', COALESCE(p.passport_num, ''),
        'birth_date', p.birth_date,
        'birth_place', COALESCE(p.birth_place, ''),
        'birth_country', COALESCE(p.birth_country, ''),
        'nationality', COALESCE(p.nationality, ''),
        'sex', COALESCE(p.sex, ''),
        'civil_status', COALESCE(p.civil_status, ''),
        'phone', COALESCE(p.phone, ''),
        'email', COALESCE(p.email, ''),
        'address_street', COALESCE(p.address_street, ''),
        'address_number', COALESCE(p.address_number, ''),
        'address_floor', COALESCE(p.address_floor, ''),
        'city', COALESCE(p.city, ''),
        'postal_code', COALESCE(p.postal_code, ''),
        'address_province', COALESCE(p.address_province, ''),
        'father_name', COALESCE(p.father_name, ''),
        'mother_name', COALESCE(p.mother_name, ''),
        'representative_name', COALESCE(p.representative_name, ''),
        'representative_nie', COALESCE(p.representative_nie, '')
    )
    INTO v_result
    FROM profiles p
    WHERE p.id = v_user_id;

    RETURN v_result;
END;
$$;

-- E. update_signer_data_by_token
CREATE OR REPLACE FUNCTION public.update_signer_data_by_token(p_token TEXT, p_updates JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_field TEXT;
    v_value TEXT;
    v_allowed_fields TEXT[] := ARRAY[
        'last_name', 'second_last_name', 'nie', 'passport_num', 
        'birth_date', 'birth_place', 'birth_country', 'nationality', 
        'sex', 'civil_status', 'phone', 'address_street', 
        'address_number', 'address_floor', 'city', 'postal_code', 
        'address_province', 'father_name', 'mother_name',
        'representative_name', 'representative_nie'
    ];
BEGIN
    SELECT client_user_id INTO v_user_id
    FROM document_signature_requests
    WHERE access_token = p_token
      AND status = 'pending';

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Token inválido o expirado.');
    END IF;

    FOR v_field, v_value IN SELECT * FROM jsonb_each_text(p_updates)
    LOOP
        IF v_field = ANY(v_allowed_fields) THEN
            EXECUTE format('UPDATE profiles SET %I = $1 WHERE id = $2', v_field)
            USING v_value, v_user_id;
        END IF;
    END LOOP;

    IF p_updates ? 'first_name' OR p_updates ? 'full_name' THEN
        UPDATE profiles SET full_name = COALESCE(p_updates->>'full_name', p_updates->>'first_name') WHERE id = v_user_id;
    END IF;

    RETURN json_build_object('success', true);
END;
$$;

-- F. complete_signature
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
    v_request RECORD;
BEGIN
    SELECT * INTO v_request
    FROM document_signature_requests
    WHERE access_token = p_token
      AND status = 'pending';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Solicitud no válida o ya completada.');
    END IF;

    -- Update request status
    UPDATE document_signature_requests
    SET status = 'signed',
        signed_at = now(),
        signed_document_path = p_signed_document_path
    WHERE id = v_request.id;

    -- Create audit log
    INSERT INTO document_signature_logs (
        signature_request_id,
        signer_name,
        signer_email,
        ip_address,
        user_agent,
        signature_hash,
        signature_storage_path
    ) VALUES (
        v_request.id,
        p_signer_name,
        p_signer_email,
        p_ip_address,
        p_user_agent,
        p_signature_hash,
        p_signature_storage_path
    );

    RETURN json_build_object('success', true);
END;
$$;

-- G. verify_document_public
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
    SELECT * INTO req
    FROM document_signature_requests
    WHERE id = p_request_id
      AND status = 'signed';

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Documento no encontrado o no está firmado.');
    END IF;

    SELECT * INTO log
    FROM document_signature_logs
    WHERE signature_request_id = req.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Registro de auditoría no encontrado.');
    END IF;

    DECLARE
        v_ip_parts TEXT[];
        v_obfuscated_ip TEXT;
    BEGIN
        v_ip_parts := string_to_array(log.ip_address, '.');
        IF array_length(v_ip_parts, 1) = 4 THEN
            v_obfuscated_ip := v_ip_parts[1] || '.' || v_ip_parts[2] || '.XX.XX';
        ELSE
            v_obfuscated_ip := '***.***.***.***';
        END IF;

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

-- --------------------------------------------------------------------
-- 3. PERMISOS (Grants)
-- --------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_signature_request_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_signature_expired(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_signature_template_mappings(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_signer_profile_full(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_signer_data_by_token(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_signature(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_document_public(UUID) TO anon, authenticated;

-- Confirmation
SELECT 'SISTEMA LISTO: Todas las funciones RPC han sido instaladas.' as status;
