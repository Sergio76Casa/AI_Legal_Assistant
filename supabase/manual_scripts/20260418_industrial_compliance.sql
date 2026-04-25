-- 🛡️ INFRAESTRUCTURA DE EFICIENCIA STARK: COMPLIANCE INDUSTRIAL
-- Fecha: 18 de Abril, 2026
-- Objetivo: Gestión de activos técnicos y optimización energética multi-idioma.

-- 1. Crear Tabla de Activos Eléctricos
CREATE TABLE IF NOT EXISTS public.electrical_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cups TEXT, -- Código Unificado de Punto de Suministro
    oca_expiry DATE, -- Organismo de Control Autorizado
    cie_expiry DATE, -- Certificado de Instalación Eléctrica (Boletín)
    preferred_language TEXT DEFAULT 'es', -- Idioma para la IA (zh, ar, ur, etc.)
    status TEXT DEFAULT 'ok', -- Calculado por Hook, pero guardamos base
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear Tabla de Analítica Energética (Insights de IA)
CREATE TABLE IF NOT EXISTS public.energy_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.electrical_assets(id) ON DELETE CASCADE,
    ai_insight TEXT,
    potential_savings NUMERIC(10, 2), -- Ejemplo: 29.80 €
    last_analysis TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Seguridad RLS
ALTER TABLE public.electrical_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_analytics ENABLE ROW LEVEL SECURITY;

-- Política: Aislamiento por Tenant
DROP POLICY IF EXISTS "Tenant Isolation - Electrical Assets" ON public.electrical_assets;
CREATE POLICY "Tenant Isolation - Electrical Assets"
    ON public.electrical_assets FOR ALL
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant Isolation - Energy Analytics" ON public.energy_analytics;
CREATE POLICY "Tenant Isolation - Energy Analytics"
    ON public.energy_analytics FOR ALL
    USING (asset_id IN (SELECT id FROM public.electrical_assets));

-- 4. SEED DE DATOS: ESCENARIOS STARK (Legal AI Global)
-- Tenant ID: '00000000-0000-0000-0000-000000000000' (Identificado en Migración Iron Silo)

DO $$ 
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
    v_asset_green UUID;
    v_asset_yellow UUID;
    v_asset_red UUID;
BEGIN
    -- Limpiar datos previos de simulación para evitar duplicados
    DELETE FROM public.electrical_assets WHERE tenant_id = v_tenant_id;

    -- EJEMPLO 1: SEDE CENTRAL (VERDE - TODO OK)
    INSERT INTO public.electrical_assets (tenant_id, name, cups, oca_expiry, cie_expiry, preferred_language)
    VALUES (v_tenant_id, 'Sede Central (Oficinas Iron Silo)', 'ES0021000000000000XX1F', CURRENT_DATE + INTERVAL '365 days', CURRENT_DATE + INTERVAL '730 days', 'es')
    RETURNING id INTO v_asset_green;

    -- EJEMPLO 2: RESTAURANTE EL FARO (AMARILLO - PRÓX. CADUCIDAD)
    -- Idioma: Árabe (Prueba de Inclusión)
    INSERT INTO public.electrical_assets (tenant_id, name, cups, oca_expiry, cie_expiry, preferred_language)
    VALUES (v_tenant_id, 'Restaurante El Faro (Grill & Sea)', 'ES0035000000000000YY2B', CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE + INTERVAL '180 days', 'ar')
    RETURNING id INTO v_asset_yellow;

    -- EJEMPLO 3: BAZAR AL-BARKAT (ROJO - CRÍTICO + AHORRO)
    -- Idioma: Chino (Prueba de Inclusión)
    INSERT INTO public.electrical_assets (tenant_id, name, cups, oca_expiry, cie_expiry, preferred_language)
    VALUES (v_tenant_id, 'Bazar Al-Barkat (Import/Export)', 'ES0048000000000000ZZ3C', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', 'zh')
    RETURNING id INTO v_asset_red;

    -- INYECTAR ANALÍTICA DE IA PARA EL BAZAR (AHORRO DETECTADO)
    INSERT INTO public.energy_analytics (asset_id, ai_insight, potential_savings)
    VALUES (v_asset_red, 'Hemos detectado que la potencia contratada (15kW) es excesiva para el consumo real (promedio 8kW). Un cambio de tarifa sugerido podría ahorrarle al cliente aproximadamente un 22% mensual.', 44.50);

    RAISE NOTICE '--- EFICIENCIA STARK: DATOS INYECTADOS ---';
    RAISE NOTICE 'Activo Verde: %', v_asset_green;
    RAISE NOTICE 'Activo Amarillo (Árabe): %', v_asset_yellow;
    RAISE NOTICE 'Activo Rojo (Chino + Ahorro): %', v_asset_red;
END $$;
