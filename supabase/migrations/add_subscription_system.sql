-- Migración: Sistema de Suscripciones y Límites
-- Fecha: 2026-02-14
-- Descripción: Implementa el modelo freemium con 3 niveles (Free, Pro, Business)

-- 1. Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'business'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Tabla de Seguimiento de Uso
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    chat_queries_count INTEGER DEFAULT 0,
    documents_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- 4. Función para crear suscripción gratuita automáticamente
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO usage_tracking (user_id, period_start, period_end)
    VALUES (
        NEW.id, 
        NOW(), 
        NOW() + INTERVAL '30 days'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para crear suscripción al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription();

-- 6. Función para obtener límites según el tier
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
            WHEN 'free' THEN 1
            WHEN 'pro' THEN 20
            WHEN 'business' THEN -1 -- ilimitado
            ELSE 1
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

-- 7. Función para verificar si el usuario puede realizar una acción
CREATE OR REPLACE FUNCTION can_perform_action(
    p_user_id UUID,
    p_action_type VARCHAR -- 'chat_query' o 'upload_document'
)
RETURNS TABLE (
    can_perform BOOLEAN,
    current_usage INTEGER,
    max_allowed INTEGER,
    tier VARCHAR
) AS $$
DECLARE
    v_tier VARCHAR;
    v_current_usage INTEGER;
    v_max_allowed INTEGER;
BEGIN
    -- Obtener tier del usuario
    SELECT s.tier INTO v_tier
    FROM subscriptions s
    WHERE s.user_id = p_user_id AND s.status = 'active';
    
    IF v_tier IS NULL THEN
        v_tier := 'free';
    END IF;
    
    -- Obtener uso actual del período
    IF p_action_type = 'chat_query' THEN
        SELECT COALESCE(ut.chat_queries_count, 0) INTO v_current_usage
        FROM usage_tracking ut
        WHERE ut.user_id = p_user_id 
        AND NOW() BETWEEN ut.period_start AND ut.period_end
        ORDER BY ut.created_at DESC
        LIMIT 1;
        
        SELECT max_chat_queries INTO v_max_allowed
        FROM get_tier_limits(v_tier);
        
    ELSIF p_action_type = 'upload_document' THEN
        SELECT COUNT(*) INTO v_current_usage
        FROM documents d
        WHERE d.user_id = p_user_id;
        
        SELECT max_documents INTO v_max_allowed
        FROM get_tier_limits(v_tier);
    END IF;
    
    -- -1 significa ilimitado
    IF v_max_allowed = -1 THEN
        RETURN QUERY SELECT TRUE, v_current_usage, v_max_allowed, v_tier;
    ELSE
        RETURN QUERY SELECT 
            (v_current_usage < v_max_allowed), 
            v_current_usage, 
            v_max_allowed, 
            v_tier;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Función para incrementar el contador de uso
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_action_type VARCHAR
)
RETURNS VOID AS $$
BEGIN
    IF p_action_type = 'chat_query' THEN
        UPDATE usage_tracking
        SET chat_queries_count = chat_queries_count + 1,
            updated_at = NOW()
        WHERE user_id = p_user_id
        AND NOW() BETWEEN period_start AND period_end;
    END IF;
    -- Los documentos se cuentan directamente desde la tabla documents
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentarios para documentación
COMMENT ON TABLE subscriptions IS 'Almacena las suscripciones de los usuarios (free, pro, business)';
COMMENT ON TABLE usage_tracking IS 'Rastrea el uso de consultas y documentos por período';
COMMENT ON FUNCTION can_perform_action IS 'Verifica si el usuario puede realizar una acción según su plan';
COMMENT ON FUNCTION increment_usage IS 'Incrementa el contador de uso para una acción específica';

-- 10. Políticas RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propia suscripción
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Usuarios pueden ver su propio uso
CREATE POLICY "Users can view own usage"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- Solo admins pueden modificar suscripciones (se hará vía service role)
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
