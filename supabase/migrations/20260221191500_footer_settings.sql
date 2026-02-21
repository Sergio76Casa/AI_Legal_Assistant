-- Migración: Footer Customization System
-- Fecha: 21 de Febrero, 2026

CREATE TABLE IF NOT EXISTS public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
    footer_custom_links JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios (público) puedan leer la configuración
DROP POLICY IF EXISTS "Public read organization_settings" ON public.organization_settings;
CREATE POLICY "Public read organization_settings"
    ON public.organization_settings FOR SELECT
    USING (true);

-- Política para que los administradores puedan gestionar su propia configuración
DROP POLICY IF EXISTS "Admin manage organization_settings" ON public.organization_settings;
CREATE POLICY "Admin manage organization_settings"
    ON public.organization_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = organization_settings.tenant_id
            AND profiles.role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = organization_settings.tenant_id
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON public.organization_settings;
CREATE TRIGGER update_organization_settings_updated_at
    BEFORE UPDATE ON public.organization_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
