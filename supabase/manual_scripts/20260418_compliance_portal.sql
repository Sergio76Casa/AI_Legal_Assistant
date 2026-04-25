-- 🛡️ PORTAL DE CUMPLIMIENTO TOTAL: INFRAESTRUCTURA DOCUMENTAL
-- Fecha: 18 de Abril, 2026
-- Objetivo: Gestión centralizada de documentos legales, técnicos y firmas electrónicas.

-- 1. Crear Tabla de Documentos de Cumplimiento
CREATE TABLE IF NOT EXISTS public.compliance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'energy', 'water', 'gas', 'oca', 'extinguisher', 'insurance', 'sanitation', 'epis', 'rent'
    name TEXT NOT NULL,
    file_url TEXT, -- URL al bucket de storage
    expiry_date DATE, -- Fecha crítica para el motor de alertas IA
    metadata JSONB DEFAULT '{}', -- Datos específicos (ej: nº póliza, autoridad sanitaria, m3 contratados, etc.)
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'pending_signature'
    
    -- Datos de Firma (Evidencia Técnica Stark)
    signature_url TEXT,
    signer_name TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad RLS
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- Política: Aislamiento por Tenant (Iron Silo™)
DROP POLICY IF EXISTS "Tenant Isolation - Compliance Documents" ON public.compliance_documents;
CREATE POLICY "Tenant Isolation - Compliance Documents"
    ON public.compliance_documents FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3. Índices para Optimización de Alertas
CREATE INDEX IF NOT EXISTS idx_compliance_expiry ON public.compliance_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_compliance_tenant_type ON public.compliance_documents(tenant_id, type);

-- 4. SEED DE DATOS: ESCENARIOS DE PORTAL (Legal AI Global)
DO $$ 
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Limpiar datos previos de simulación
    DELETE FROM public.compliance_documents WHERE tenant_id = v_tenant_id;

    -- SEGURO DE RESPONSABILIDAD CIVIL (RCA) - Activo
    INSERT INTO public.compliance_documents (tenant_id, type, name, expiry_date, metadata)
    VALUES (v_tenant_id, 'insurance', 'Seguro RC Industrial (Mapfre)', CURRENT_DATE + INTERVAL '120 days', '{"policy_number": "RCA-993822", "coverage": "3.000.000 €"}');

    -- CERTIFICADO DE SANIDAD (APPCC) - Crítico
    INSERT INTO public.compliance_documents (tenant_id, type, name, expiry_date, metadata)
    VALUES (v_tenant_id, 'sanitation', 'Certificado Sanitario APPCC', CURRENT_DATE - INTERVAL '5 days', '{"authority": "Sanidad Exterior", "last_inspection": "2024-03-10"}');

    -- CONTRATO DE ARRENDAMIENTO - Próxima Caducidad
    INSERT INTO public.compliance_documents (tenant_id, type, name, expiry_date, metadata)
    VALUES (v_tenant_id, 'rent', 'Contrato Alquiler Nave Industrial', CURRENT_DATE + INTERVAL '25 days', '{"lessor": "Iron Silo Properties", "rent_amount": 4200}');

    RAISE NOTICE '--- PORTAL DOCUMENTAL: DATOS INYECTADOS ---';
END $$;

-- 5. INFRAESTRUCTURA DE ALMACENAMIENTO (STORAGE)
-- Bucket para firmas y evidencias
INSERT INTO storage.buckets (id, name, public) 
VALUES ('compliance', 'compliance', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Seguridad: Aislamiento por Carpeta de Tenant
-- Ruta esperada: {tenant_id}/signatures/{doc_id}.png
DROP POLICY IF EXISTS "Tenant Isolation - Compliance Storage" ON storage.objects;
CREATE POLICY "Tenant Isolation - Compliance Storage"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'compliance' 
        AND (storage.foldername(name))[1] = (SELECT tenant_id::text FROM public.profiles WHERE id = auth.uid())
    );

-- 6. PERMISOS ADICIONALES DE TABLA
-- Permitir actualizar para firmar documentos propios
DROP POLICY IF EXISTS "Tenant Update - Compliance Documents" ON public.compliance_documents;
CREATE POLICY "Tenant Update - Compliance Documents"
    ON public.compliance_documents FOR UPDATE
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
