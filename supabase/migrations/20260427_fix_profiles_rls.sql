-- Migración para corregir visibilidad de perfiles para Admins y Superadmins
-- Esta migración resuelve el problema donde las fichas de cliente aparecían vacías
-- debido a que la política RLS solo permitía a los usuarios ver su propio ID.

-- 1. Asegurar que RLS esté activo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas antiguas restrictivas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view members of their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update members of their tenant" ON public.profiles;

-- 3. POLÍTICAS DE LECTURA (SELECT)

-- Cada usuario puede ver su propio perfil
CREATE POLICY "Profiles - Self Read"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Superadmin puede ver TODOS los perfiles de la plataforma (Bypass de Tenant)
CREATE POLICY "Profiles - Superadmin Global Read"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Admin puede ver los perfiles de su propia organización (Aislamiento de Tenant)
CREATE POLICY "Profiles - Admin Tenant Read"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND tenant_id = public.profiles.tenant_id
        )
    );

-- 4. POLÍTICAS DE ACTUALIZACIÓN (UPDATE)

-- Cada usuario puede actualizar sus propios datos
CREATE POLICY "Profiles - Self Update"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Superadmin puede actualizar cualquier perfil
CREATE POLICY "Profiles - Superadmin Global Update"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Admin puede actualizar perfiles de su propia organización
CREATE POLICY "Profiles - Admin Tenant Update"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND tenant_id = public.profiles.tenant_id
        )
    );
