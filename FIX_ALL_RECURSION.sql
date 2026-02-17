-- SOLUCIÓN MAESTRA: Arreglar Recursión en Profiles + RPC Documentos
-- Este script arregla el error "infinite recursion" y asegura los documentos.

-- PARTE 1: ARREGLAR LA RECURSIÓN EN PROFILES
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Ver propios datos" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin ve todo" ON public.profiles;
DROP POLICY IF EXISTS "Admin ve tenant" ON public.profiles;

-- Política 1: Ver mi propio perfil (Sin recursión, directo al ID)
CREATE POLICY "Ver mi perfil" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

-- Política 2: Superadmins ven todo (Usando función segura para evitar bucle)
CREATE OR REPLACE FUNCTION public.is_superadmin_safe()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Esto es la clave: se ejecuta como "dios" (postgres)
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- Usamos la función en la política
CREATE POLICY "Superadmin ve todo"
ON public.profiles FOR ALL
USING ( is_superadmin_safe() );

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PARTE 2: RECREAR FUNCIÓN DE DOCUMENTOS (Sin columnas inválidas)
DROP FUNCTION IF EXISTS public.get_admin_documents();

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
  -- Retorna TODOS los documentos ordenados
  SELECT 
    id, name, url, type, tenant_id, created_at, user_id, status, country
  FROM public.documents
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO service_role;
