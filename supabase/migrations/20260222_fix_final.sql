-- 1. ADD MISSING COLUMNS TO PROFILES
ALTER TABLE public.profiles
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

-- 2. RPC TO FETCH FULL MAPPINGS (WITH COORDINATES) FOR SIGNING FLOW
-- This bypasses RLS for the signature flow using the token.
CREATE OR REPLACE FUNCTION public.get_template_mappings_with_coords(p_token TEXT)
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
    WHERE access_token = p_token;

    IF v_template_id IS NULL THEN
        RETURN '[]'::JSON;
    END IF;

    SELECT COALESCE(json_agg(m.*), '[]'::JSON)
    INTO v_result
    FROM form_fields_mapping m
    WHERE m.template_id = v_template_id;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_template_mappings_with_coords(TEXT) TO anon, authenticated;
