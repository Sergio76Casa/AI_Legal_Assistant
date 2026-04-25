-- Migración: Corregir relación para permitir joins en consultas de afiliados
-- Fecha: 17 de Abril, 2026

-- 1. Añadir clave foránea explícita entre affiliate_referrals y profiles
-- Esto permite que PostgREST resuelva la relación referal_id -> profiles automáticamente
ALTER TABLE public.affiliate_referrals 
DROP CONSTRAINT IF EXISTS fk_referred_user_profile;

ALTER TABLE public.affiliate_referrals 
ADD CONSTRAINT fk_referred_user_profile 
FOREIGN KEY (referred_user_id) REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 2. Asegurar que haya un índice para esta relación
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_profile ON public.affiliate_referrals(referred_user_id);

-- 3. Actualizar políticas de RLS para Admin (Earnings)
-- El admin debe poder ver todas las comisiones para el panel de ganancias
DROP POLICY IF EXISTS "Admins can view all commissions" ON public.affiliate_commissions;
CREATE POLICY "Admins can view all commissions"
    ON public.affiliate_commissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all referrals" ON public.affiliate_referrals;
CREATE POLICY "Admins can view all referrals"
    ON public.affiliate_referrals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
        )
    );
