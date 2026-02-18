-- SOLUCIÓN FINAL: Usar una función de seguridad (SECURITY DEFINER)
-- Esto evita problemas de "permisos recursivos" al leer la tabla de perfiles.

-- 1. Crear función segura para verificar si soy admin
--    Esta función se ejecuta con permisos de "postgres" (bypasea RLS), 
--    por lo que SIEMPRE puede leer la tabla profiles correctamente.
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- 2. Reactivar seguridad en Documents (la habíamos quitado para probar)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas viejas
DROP POLICY IF EXISTS "Politica_Universal_Documentos" ON public.documents;
DROP POLICY IF EXISTS "Tenant Isolation - Documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.documents;

-- 4. Crear la Política Maestra usando la función segura
CREATE POLICY "Politica_Universal_Documentos"
ON public.documents
FOR SELECT
TO authenticated
USING (
  -- A. Documentos Globales (Visible para TODOS)
  tenant_id = '00000000-0000-0000-0000-000000000000'

  OR

  -- B. Propietario (Siempre ve lo suyo)
  auth.uid() = user_id

  OR

  -- C. Superadmin (Usando la función segura que acabamos de crear)
  is_superadmin()
);
