-- FUNCIÓN MAESTRA (RPC) PARA PANEL ADMIN - CORREGIDA
-- Quitamos la columna 'metadata' si no existe.

CREATE OR REPLACE FUNCTION public.get_admin_documents()
RETURNS TABLE (
  id uuid,
  name text,
  url text,
  type text,
  tenant_id uuid,
  created_at timestamptz,
  user_id uuid,
  status text,
  country text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Retorna TODOS los documentos (sin metadata ni updated_at)
  SELECT 
    id, name, url, type, tenant_id, created_at, user_id, status, country
  FROM public.documents
  ORDER BY created_at DESC;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO service_role;
