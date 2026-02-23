-- Migración: Configuración Dinámica de Aplicación (Business Settings)
-- Fecha: 23 de Febrero, 2026
-- Objetivo: Almacenar metadatos comerciales y % de comisiones en DB

-- 1. Crear Tabla
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    settings JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Restricción para asegurar que solo exista una fila 'global'
ALTER TABLE public.app_settings ADD CONSTRAINT only_one_row CHECK (id = 'global');

-- 2. Insertar valores por defecto (Starter, Business, Enterprise + 20% Comisión)
INSERT INTO public.app_settings (id, settings)
VALUES (
    'global',
    '{
        "plan_names": {
            "free": "Starter",
            "pro": "Business",
            "business": "Enterprise"
        },
        "affiliate_commission_rate": 20
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Blindaje RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública (necesaria para el frontend y webhook)
CREATE POLICY "Public read app_settings"
    ON public.app_settings FOR SELECT
    USING (true);

-- Escritura solo para Superadmin
CREATE POLICY "Superadmin manage app_settings"
    ON public.app_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- 4. Trigger para auto-update de updated_at
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_app_settings_timestamp
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_timestamp();
