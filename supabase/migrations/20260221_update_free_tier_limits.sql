-- Migración: Actualizar Límite Plan Free
-- Descripción: Ajusta el número máximo de expedientes/documentos permitidos para el plan Starter (free) de 1 a 10.

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
            WHEN 'free' THEN 5
            WHEN 'pro' THEN 100
            WHEN 'business' THEN -1 -- ilimitado
            ELSE 5
        END AS max_chat_queries,
        CASE p_tier
            WHEN 'free' THEN 10 -- Actualizado de 1 a 10
            WHEN 'pro' THEN 20
            WHEN 'business' THEN -1 -- ilimitado
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
