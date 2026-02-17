-- DIAGNOSTICO DE FALLO DE RLS
-- Vamos a ver por qué la política dice "falso".

-- 1. Ver qué devuelve la función 'is_superadmin()' que creamos
SELECT is_superadmin();

-- 2. Ver tus datos de perfil en una consulta aislada
-- Deberías ver: id, role, tenant_id, email, etc.
-- Si esto está vacío, significa que tu usuario de profiles NO existe o RLS de profiles lo bloquea.
SELECT * FROM public.profiles WHERE id = auth.uid();

-- 3. SOLUCIÓN DE EMERGENCIA: Política basada en EMAIL (Hardcoded)
-- Esto soluciona problemas si la tabla 'profiles' falla por RLS recursivo.

DROP POLICY IF EXISTS "Politica_Universal_Documentos" ON public.documents;

CREATE POLICY "Politica_Universal_Documentos"
ON public.documents
FOR SELECT
TO authenticated
USING (
  -- A. Documentos Globales (ID cero)
  tenant_id = '00000000-0000-0000-0000-000000000000'

  OR

  -- B. Dueño
  user_id = auth.uid()

  OR

  -- C. Superadmin HARDCODED (Saltándose la tabla profiles)
  (auth.jwt() ->> 'email') = 'lsergiom76@gmail.com'
);
