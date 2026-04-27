-- Misión: Sistema de Papelera (Soft Delete) para Clientes
-- Fecha: 27 de Abril, 2026

-- 1. Añadir columna de fecha de eliminación
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Actualizar políticas RLS para filtrar por estado de eliminación por defecto

-- Primero eliminamos las que creamos antes para unificarlas con la lógica de Soft Delete
DROP POLICY IF EXISTS "Profiles - Self Read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Superadmin Global Read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Admin Tenant Read" ON public.profiles;

-- Nueva Política: Lectura de perfiles activos
-- Esta política asegura que por defecto nadie vea registros borrados en consultas normales
CREATE POLICY "Profiles - Standard Visibility"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        (deleted_at IS NULL) AND (
            (auth.uid() = id) -- Ver perfil propio
            OR 
            EXISTS ( -- Superadmin ve todo lo activo
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'superadmin'
            )
            OR
            EXISTS ( -- Admin ve su tenant activo
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'admin' 
                AND tenant_id = public.profiles.tenant_id
            )
        )
    );

-- Nueva Política: Acceso a la Papelera
-- Solo Admins y Superadmins pueden ver registros donde deleted_at IS NOT NULL
CREATE POLICY "Profiles - Trash Visibility"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        (deleted_at IS NOT NULL) AND (
            EXISTS ( -- Superadmin ve toda la papelera
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'superadmin'
            )
            OR
            EXISTS ( -- Admin ve la papelera de su tenant
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'admin' 
                AND tenant_id = public.profiles.tenant_id
            )
        )
    );

-- 3. Políticas de actualización (Necesarias para Soft Delete y Restore)
DROP POLICY IF EXISTS "Profiles - Superadmin Global Update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles - Admin Tenant Update" ON public.profiles;

CREATE POLICY "Profiles - Universal Management"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND tenant_id = public.profiles.tenant_id
        )
    );

-- 4. Política de borrado permanente
DROP POLICY IF EXISTS "Profiles - Permanent Deletion" ON public.profiles;
CREATE POLICY "Profiles - Permanent Deletion"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND tenant_id = public.profiles.tenant_id
        )
    );
