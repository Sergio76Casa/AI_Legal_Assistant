-- SIMULACIÓN DE PRUEBA MAESTRA: STRIPE + AFILIADOS
-- Paso 1: Configurar Afiliado de Prueba (Carmen/Partner)
DO $$ 
DECLARE
    v_affiliate_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- ID Ficticio Carmen
    v_affiliate_id UUID;
    v_referred_user_id UUID := '00000000-0000-0000-0000-000000000002'; -- ID Ficticio Cliente Nuevo
    v_invoice_id VARCHAR := 'in_sim_master_test_2980';
BEGIN
    -- 1. Crear Perfil de Afiliado si no existe
    INSERT INTO public.profiles (id, username, full_name, role)
    VALUES (v_affiliate_user_id, 'carmen_partner', 'Carmen Affiliate', 'user')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Registrar como Afiliado
    INSERT INTO public.affiliates (user_id, affiliate_code, status, total_earned)
    VALUES (v_affiliate_user_id, 'SIMULATE-2980', 'active', 100.00) -- Empezamos con 100€
    ON CONFLICT (user_id) DO UPDATE SET status = 'active'
    RETURNING id INTO v_affiliate_id;

    -- 3. Crear Perfil de Cliente Nuevo
    INSERT INTO public.profiles (id, username, full_name, subscription_tier)
    VALUES (v_referred_user_id, 'cliente_test', 'Juan Cliente', 'free')
    ON CONFLICT (id) DO NOTHING;

    -- 4. SIMULACIÓN checkout.session.completed (Vinculación)
    INSERT INTO public.affiliate_referrals (affiliate_id, referred_user_id)
    VALUES (v_affiliate_id, v_referred_user_id)
    ON CONFLICT (referred_user_id) DO NOTHING;

    -- 5. SIMULACIÓN invoice.paid (Comisión fija Business 29.80€)
    INSERT INTO public.affiliate_commissions (referral_id, stripe_invoice_id, amount, status)
    VALUES (
        (SELECT id FROM public.affiliate_referrals WHERE referred_user_id = v_referred_user_id),
        v_invoice_id,
        29.80,
        'paid'
    )
    ON CONFLICT (stripe_invoice_id) DO NOTHING;

    -- 6. INCREMENTAR GANANCIAS (Llamada a la función RPC)
    PERFORM public.increment_affiliate_earnings(v_affiliate_id, 29.80);

    -- 7. ACTUALIZAR NOTIFICACIÓN EN PERFIL DEL AFILIADO
    UPDATE public.profiles
    SET last_notification = '¡Felicidades! Tienes una nueva comisión acumulada de 29.80€.'
    WHERE id = v_affiliate_user_id;

    -- 8. DESBLOQUEAR PREMIUM (Suscripción Business)
    -- Asumimos que existe la tabla subscriptions del paso anterior
    INSERT INTO public.subscriptions (user_id, tier, status, current_period_end)
    VALUES (v_referred_user_id, 'business', 'active', (NOW() + INTERVAL '30 days'))
    ON CONFLICT (user_id) DO UPDATE SET tier = 'business', status = 'active';

    -- REPORTE DE RESULTADOS
    RAISE NOTICE '--- REPORTE DE SIMULACIÓN ---';
    RAISE NOTICE 'Affiliate Balance: %', (SELECT total_earned FROM public.affiliates WHERE id = v_affiliate_id);
    RAISE NOTICE 'Client Tier: %', (SELECT tier FROM public.subscriptions WHERE user_id = v_referred_user_id);
    RAISE NOTICE 'Notification Set: %', (SELECT last_notification FROM public.profiles WHERE id = v_affiliate_user_id);
END $$;
