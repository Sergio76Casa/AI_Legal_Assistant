-- FIX DEFINITIVO (COMPATIBLE CON SUPABASE EDITOR)
-- Sin comando \set que fallan en la web.

-- 1. Asegurar que lsergiom76@gmail.com es Superadmin y está en el Global Tenant
UPDATE public.profiles
SET 
  role = 'superadmin',
  tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'lsergiom76@gmail.com');

-- 2. Limpieza de Políticas duplicadas o viejas
DROP POLICY IF EXISTS "Tenant Isolation - Documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.documents;
DROP POLICY IF EXISTS "Politica_Universal_Documentos" ON public.documents;

-- 3. Nueva Política Maestra
-- Simple: Si eres Superadmin O el documento es Global -> Lo ves.
CREATE POLICY "Politica_Universal_Documentos"
ON public.documents
FOR SELECT
TO authenticated
USING (
  -- A. Documentos Globales (Visible para TODOS)
  tenant_id = '00000000-0000-0000-0000-000000000000'

  OR

  -- B. Propietario del documento
  auth.uid() = user_id

  OR

  -- C. Superadmins (Bypass total buscando el rol en profiles)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- 4. Mover documentos huérfanos al Global
UPDATE public.documents
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;
