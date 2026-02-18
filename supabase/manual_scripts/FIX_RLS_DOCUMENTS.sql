-- FIX ROBUSTO: Acceso Total para Superadmin y Corrección de Datos

-- 1. Eliminar política anterior
DROP POLICY IF EXISTS "Tenant Isolation - Documents" ON public.documents;

-- 2. Política Maestra (Superadmin ve todo, otros ven lo suyo o lo global)
CREATE POLICY "Tenant Isolation - Documents"
    ON public.documents FOR SELECT
    USING (
        -- NIVEL 1: El Superadmin ve TODO (Bypass total)
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        
        OR
        
        -- NIVEL 2: Documentos Globales (Para todos los usuarios básicos)
        tenant_id = '00000000-0000-0000-0000-000000000000'
        
        OR
        
        -- NIVEL 3: Documentos Propios o del mismo Tenant
        (
            auth.uid() = user_id 
            OR 
            tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 3. CORRECCIÓN DE DATOS (DATA REPAIR)
-- Forzar que todos los documentos HUÉRFANOS (sin tenant o sin user) vayan al Global
UPDATE public.documents 
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- 4. Asegurarnos que TU usuario (Superadmin) esté en el Tenant Global (para que la lógica de "mis documentos" coincida)
-- Esto mueve al superadmin al tenant global si estaba 'flotando'.
UPDATE public.profiles
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE role = 'superadmin' AND tenant_id IS NULL;
