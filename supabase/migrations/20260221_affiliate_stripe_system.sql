-- Migración: Sistema de Comisiones y Webhooks de Stripe
-- Fecha: 2026-02-21
-- Descripción: Tablas para rastrear referidos, comisiones y sincronización con Stripe

-- 0. Asegurar que la tabla affiliates existe
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active'
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 1. Tabla de Referidos (Vinculación permanente Cliente-Afiliado)
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_user_id) -- Un usuario solo puede ser referido por un afiliado
);

-- 2. Tabla de Comisiones (Rastreo de pagos y saldo)
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL, -- Cantidad de la comisión (ej: 29.80)
    currency VARCHAR(10) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON public.affiliate_commissions(status);

-- 4. RLS para Afiliados
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Los afiliados pueden ver sus propios referidos
CREATE POLICY "Affiliates can view own referrals"
    ON public.affiliate_referrals FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates WHERE user_id = auth.uid()
        )
    );

-- Los afiliados pueden ver sus propias comisiones
CREATE POLICY "Affiliates can view own commissions"
    ON public.affiliate_commissions FOR SELECT
    USING (
        referral_id IN (
            SELECT id FROM public.affiliate_referrals WHERE affiliate_id IN (
                SELECT id FROM public.affiliates WHERE user_id = auth.uid()
            )
        )
    );

-- 6. Función para incrementar ganancias del afiliado de forma atómica
CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(
    p_affiliate_id UUID,
    p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.affiliates
    SET total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Comentarios
COMMENT ON TABLE affiliate_referrals IS 'Vincula a un nuevo usuario con el afiliado que lo trajo';
COMMENT ON TABLE affiliate_commissions IS 'Registra cada comisión generada por los pagos de los referidos';
