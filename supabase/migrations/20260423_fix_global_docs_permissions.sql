-- Migración: Permisos para documentos globales (superadmin)
-- Fecha: 2026-04-23
-- Problema: Los documentos globales (user_id = null) no se pueden borrar ni insertar
-- desde el cliente porque las políticas RLS requieren user_id = auth.uid().

-- 1. Hacer user_id nullable en documents (los docs globales no tienen usuario dueño)
ALTER TABLE public.documents
    ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eliminar políticas antiguas restrictivas en documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Tenant Isolation - Documents"        ON public.documents;

-- 3. Nuevas políticas para documents

-- SELECT: propio usuario O global (tenant_id = '00000000-...') O superadmin
DROP POLICY IF EXISTS "Documents - select own or global" ON public.documents;
CREATE POLICY "Documents - select own or global"
    ON public.documents FOR SELECT
    USING (
        auth.uid() = user_id
        OR tenant_id = '00000000-0000-0000-0000-000000000000'
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- INSERT: usuario inserta el suyo O superadmin inserta globals (user_id null)
DROP POLICY IF EXISTS "Documents - insert own or superadmin global" ON public.documents;
CREATE POLICY "Documents - insert own or superadmin global"
    ON public.documents FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR (
            user_id IS NULL
            AND tenant_id = '00000000-0000-0000-0000-000000000000'
            AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        )
    );

-- DELETE: propio usuario O superadmin puede borrar cualquiera
DROP POLICY IF EXISTS "Documents - delete own or superadmin" ON public.documents;
CREATE POLICY "Documents - delete own or superadmin"
    ON public.documents FOR DELETE
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );

-- 4. Actualizar políticas de knowledge_base

-- Eliminar políticas antiguas en knowledge_base
DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete their own knowledge chunks" ON public.knowledge_base;

-- INSERT: propio usuario O service_role (edge functions usan service_role)
DROP POLICY IF EXISTS "KB - insert own or service" ON public.knowledge_base;
CREATE POLICY "KB - insert own or service"
    ON public.knowledge_base FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR user_id IS NULL  -- permitido para globals via edge function (service_role)
    );

-- DELETE: propio usuario O superadmin puede borrar cualquiera
DROP POLICY IF EXISTS "KB - delete own or superadmin" ON public.knowledge_base;
CREATE POLICY "KB - delete own or superadmin"
    ON public.knowledge_base FOR DELETE
    USING (
        auth.uid() = user_id
        OR user_id IS NULL
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    );
