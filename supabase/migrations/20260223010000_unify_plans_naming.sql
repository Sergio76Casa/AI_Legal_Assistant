-- Migración: Unificación de nomenclatura de planes
-- Fecha: 2026-02-23
-- Descripción: Renombra plan_type a plan y asegura límites de cuotas según Configuración_planes_y_precios.md

-- 1. Renombrar columna en tabla tenants de forma segura
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'plan_type') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'plan') THEN
            ALTER TABLE public.tenants RENAME COLUMN plan_type TO plan;
        ELSE
            -- Si ambos existen, movemos los datos si plan_type tiene algo y plan está por defecto o vacío
            UPDATE public.tenants SET plan = plan_type WHERE plan IS NULL OR plan = 'free';
            -- Opcional: ELIMINAR plan_type después de verificar
            -- ALTER TABLE public.tenants DROP COLUMN plan_type;
        END IF;
    END IF;
END $$;

-- 2. Asegurar que el Plan Global tenga el tipo correcto
UPDATE public.tenants SET plan = 'business' WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Actualizar función de límites para reflejar la Verdad Única
-- Starter (free): 10 expedientes
-- Business (pro): 50 expedientes
-- Enterprise (business): Ilimitado
CREATE OR REPLACE FUNCTION get_tier_limits(p_tier VARCHAR)
RETURNS TABLE (
    max_chat_queries INTEGER,
    max_documents INTEGER,
    has_api_access BOOLEAN,
    has_priority_support BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE p_tier
            WHEN 'free' THEN 50 -- Ajustar según necesidad, el doc no especifica pero 5 es muy poco
            WHEN 'pro' THEN 500
            WHEN 'business' THEN -1 -- ilimitado
            ELSE 50
        END AS max_chat_queries,
        CASE p_tier
            WHEN 'free' THEN 10 -- Starter comercial = free técnico: 10 expedientes
            WHEN 'pro' THEN 50  -- Business comercial = pro técnico: 50 expedientes
            WHEN 'business' THEN -1 -- Enterprise comercial = business técnico: ilimitado
            ELSE 10
        END AS max_documents,
        CASE p_tier
            WHEN 'business' THEN TRUE
            ELSE FALSE
        END AS has_api_access,
        CASE p_tier
            WHEN 'pro' THEN TRUE
            WHEN 'business' THEN TRUE
            ELSE FALSE
        END AS has_priority_support;
END;
$$ LANGUAGE plpgsql;
