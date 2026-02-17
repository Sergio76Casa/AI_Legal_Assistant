-- SOLUCIÓN NUCLEAR PARA LA RECURSIÓN
-- Este script borra TODAS las políticas de 'profiles' dinámicamente para asegurar que no quede ninguna basura.
-- Y luego crea SOLO las necesarias.

-- 1. Bloque anónimo para borrar TODAS las políticas de 'profiles'
DO $$ 
DECLARE 
    pol record; 
BEGIN 
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname); 
    END LOOP; 
END $$;

-- 2. Asegurarnos de que RLS esté activo pero limpio
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear UNA ÚNICA política simple para empezar (Ver mi propio perfil)
-- Esta condición "id = auth.uid()" NO causa recursión porque compara el valor de la columna directo con la sesión.
CREATE POLICY "Simple Ver Propio Perfil"
ON public.profiles
FOR SELECT
USING ( id = auth.uid() );

-- 4. Recrear la función de seguridad para Superadmin con propietario POSTGRES EXPLÍCITO
CREATE OR REPLACE FUNCTION public.is_superadmin_safe()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Se ejecuta con permisos del dueño (postgres)
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

ALTER FUNCTION public.is_superadmin_safe() OWNER TO postgres;

-- 5. Política para que Superadmin vea otros perfiles (Usando la función segura)
CREATE POLICY "Superadmin Ve Todo"
ON public.profiles
FOR SELECT
USING ( public.is_superadmin_safe() );

-- 6. Política para INSERT/UPDATE (Necesario para nuevos usuarios)
CREATE POLICY "Usuario edita lo suyo"
ON public.profiles
FOR ALL
USING ( id = auth.uid() );

-- 7. REPARACIÓN DEL TUNEL RPC (Por si acaso se rompió)
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
  SELECT id, name, url, type, tenant_id, created_at, user_id, status, country
  FROM public.documents
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_documents() TO service_role;
