-- Migration: Dynamic Form Support for Signature Flow
-- Date: 2026-02-22
-- Description: Extends profiles table and adds RPCs for the dynamic data entry before signing.

-- 1. EXTEND PROFILES TABLE mit missing fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS second_last_name TEXT,
ADD COLUMN IF NOT EXISTS nie TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS birth_country TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS sex TEXT, -- male, female, other
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

-- 2. UPDATED GET SIGNATURE FIELDS (return all mapped fields for the template)
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
    -- Get template_id from request token
    SELECT template_id INTO v_template_id
    FROM document_signature_requests
    WHERE access_token = p_token
      AND status = 'pending';

    IF v_template_id IS NULL THEN
        RETURN '[]'::JSON;
    END IF;

    SELECT COALESCE(json_agg(f.*), '[]'::JSON)
    INTO v_result
    FROM (
        -- Global field mappings for this template
        SELECT *
        FROM form_fields_mapping
        WHERE template_id = v_template_id
    ) f;

    RETURN v_result;
END;
$$;

-- 3. GET FULL SIGNER PROFILE (restricted by token)
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
    WHERE access_token = p_token
      AND status = 'pending';

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'first_name', p.full_name, -- Map full_name to first_name for compatibility if needed, but let's be explicit
        'full_name', p.full_name,
        'last_name', p.last_name,
        'second_last_name', p.second_last_name,
        'nie', p.nie,
        'passport_num', p.passport_num,
        'birth_date', p.birth_date,
        'birth_place', p.birth_place,
        'birth_country', p.birth_country,
        'nationality', p.nationality,
        'sex', p.sex,
        'civil_status', p.civil_status,
        'phone', p.phone,
        'email', p.email,
        'address_street', p.address_street,
        'address_number', p.address_number,
        'address_floor', p.address_floor,
        'city', p.city,
        'postal_code', p.postal_code,
        'address_province', p.address_province,
        'father_name', p.father_name,
        'mother_name', p.mother_name,
        'representative_name', p.representative_name,
        'representative_nie', p.representative_nie
    )
    INTO v_result
    FROM profiles p
    WHERE p.id = v_user_id;

    RETURN v_result;
END;
$$;

-- 4. UPDATE SIGNER DATA (Dynamic update)
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
    v_query TEXT;
    v_allowed_fields TEXT[] := ARRAY[
        'last_name', 'second_last_name', 'nie', 'passport_num', 
        'birth_date', 'birth_place', 'birth_country', 'nationality', 
        'sex', 'civil_status', 'phone', 'address_street', 
        'address_number', 'address_floor', 'city', 'postal_code', 
        'address_province', 'father_name', 'mother_name',
        'representative_name', 'representative_nie', 'passport_num'
    ];
BEGIN
    -- Validate token and get user
    SELECT client_user_id INTO v_user_id
    FROM document_signature_requests
    WHERE access_token = p_token
      AND status = 'pending';

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Invalid token or request expired');
    END IF;

    -- Basic protection: update fields one by one if they are in the allowed list
    -- This is safer than a raw dynamic query
    FOR v_field, v_value IN SELECT * FROM jsonb_each_text(p_updates)
    LOOP
        IF v_field = ANY(v_allowed_fields) THEN
            EXECUTE format('UPDATE profiles SET %I = $1 WHERE id = $2', v_field)
            USING v_value, v_user_id;
        END IF;
    END LOOP;

    -- Handle special case for full name if first_name is passed
    IF p_updates ? 'first_name' THEN
        UPDATE profiles SET full_name = p_updates->>'first_name' WHERE id = v_user_id;
    END IF;

    RETURN json_build_object('success', true);
END;
$$;

-- 5. GRANTS
GRANT EXECUTE ON FUNCTION public.get_signature_template_mappings(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_signer_profile_full(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_signer_data_by_token(TEXT, JSONB) TO anon, authenticated;
