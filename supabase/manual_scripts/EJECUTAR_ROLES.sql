-- Migración: Roles y Jerarquía
-- Objetivo: Definir roles (Admin vs Member) dentro de cada Tenant

-- 1. Añadir columna 'role' a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- 2. Asegurar que el Superadmin tenga el rol correcto (opcional, visual)
-- (Tú ya eres superadmin por email hardcodeado, pero esto ayuda a futuro)
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email = 'lsergiom76@gmail.com';

-- 3. Crear índice para búsquedas rápidas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. Política: Los Admins de Tenant pueden ver a los miembros de SU propio Tenant
DROP POLICY IF EXISTS "Admins can view tenant members" ON public.profiles;
CREATE POLICY "Admins can view tenant members"
    ON public.profiles FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );
-- Nota: Esta política es amplia (permite ver a todos los del mismo tenant). 
-- Si quisiéramos privacidad total entre empleados, la restringiríamos a solo 'admin'. 
-- Para una herramienta de colaboración, ver a tus compañeros suele ser deseable.
