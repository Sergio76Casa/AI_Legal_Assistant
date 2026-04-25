-- Migración: Corregir políticas RLS para la tabla Tenants
-- Fecha: 2026-04-24
-- Objetivo: Asegurar que Superadmins vean todo y Admins solo su propia organización.

-- 1. Eliminar política pública general (demasiado abierta o conflictiva)
DROP POLICY IF EXISTS "Public read access to tenants" ON public.tenants;

-- 2. Política para permitir ver el nombre/slug públicamente (necesario para login/contexto sin login)
DROP POLICY IF EXISTS "Tenants - Public view for slug resolution" ON public.tenants;
CREATE POLICY "Tenants - Public view for slug resolution"
    ON public.tenants FOR SELECT
    USING (true); -- Permitimos ver nombres/slugs de organizaciones para resolver rutas.

-- 3. Política para Superadmins (acceso total a la tabla)
DROP POLICY IF EXISTS "Tenants - Superadmin full access" ON public.tenants;
CREATE POLICY "Tenants - Superadmin full access"
    ON public.tenants FOR ALL
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    )
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- 4. Política para Admins (ver y editar SOLO su propia organización)
DROP POLICY IF EXISTS "Tenants - Admin self-tenant access" ON public.tenants;
CREATE POLICY "Tenants - Admin self-tenant access"
    ON public.tenants FOR ALL
    USING (
        (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = id
        AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = id
        AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 5. Asegurar que el Superadmin (lsergiom76@gmail.com) tenga el rol correcto en la DB
-- Buscamos al usuario por email y le asignamos superadmin si no lo tiene.
UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'lsergiom76@gmail.com';
