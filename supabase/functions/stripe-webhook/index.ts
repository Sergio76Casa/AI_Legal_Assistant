// supabase/functions/stripe-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno'

// Configuración de Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createFullCryptoProvider()

Deno.serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 })
    }

    try {
        const rawBody = await req.text()
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

        // Verificación de la firma del Webhook
        let event
        try {
            event = await stripe.webhooks.constructEventAsync(
                rawBody,
                signature,
                endpointSecret,
                undefined,
                cryptoProvider
            )
        } catch (err) {
            console.error(`⚠️ Webhook signature verification failed.`, err.message)
            return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 })
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`🔔 Event received: ${event.type}`)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.client_reference_id
                const referralCode = session.metadata?.referral_code
                const subscriptionId = session.subscription
                const customerId = session.customer

                if (userId) {
                    // 1. Vincular con Afiliado si existe código
                    if (referralCode) {
                        const { data: affiliate } = await supabaseAdmin
                            .from('affiliates')
                            .select('id')
                            .eq('affiliate_code', referralCode)
                            .single()

                        if (affiliate) {
                            await supabaseAdmin.from('affiliate_referrals').upsert({
                                affiliate_id: affiliate.id,
                                referred_user_id: userId
                            })
                            console.log(`✅ User ${userId} linked to affiliate ${affiliate.id}`)
                        }
                    }

                    // 2. Actualizar suscripción con el stripe_subscription_id
                    if (subscriptionId) {
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({
                                stripe_subscription_id: subscriptionId,
                                stripe_customer_id: customerId,
                                status: 'active'
                            })
                            .eq('user_id', userId)
                    }
                }
                break
            }

            case 'invoice.paid': {
                const invoice = event.data.object
                const subscriptionId = invoice.subscription as string
                const amountPaid = invoice.amount_paid / 100

                // Buscar suscripción para obtener el user_id y tier
                const { data: sub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('user_id, tier')
                    .eq('stripe_subscription_id', subscriptionId)
                    .single()

                if (sub) {
                    // Verificar si el usuario tiene un referido activo
                    const { data: referral } = await supabaseAdmin
                        .from('affiliate_referrals')
                        .select('id, affiliate_id')
                        .eq('referred_user_id', sub.user_id)
                        .single()

                    if (referral) {
                        // 1. Lógica de Comisión Fija por Plan Business
                        // Si el tier es 'business' o el monto corresponde al plan (aprox 149€), comisión fija 29.80€
                        const isBusiness = sub.tier === 'business' || amountPaid > 100
                        const commissionAmount = isBusiness ? 29.80 : (amountPaid * 0.20)

                        const { error: commError } = await supabaseAdmin.from('affiliate_commissions').insert({
                            referral_id: referral.id,
                            stripe_invoice_id: invoice.id,
                            amount: commissionAmount,
                            status: 'paid'
                        })

                        if (!commError) {
                            // 2. Actualizar saldo del afiliado
                            await supabaseAdmin.rpc('increment_affiliate_earnings', {
                                p_affiliate_id: referral.affiliate_id,
                                p_amount: commissionAmount
                            })

                            // 3. Notificación al Afiliado (Dashboard Meta-Update)
                            // Podemos insertar un aviso en una tabla de notificaciones si existiera, 
                            // o simplemente actualizar un flag en el perfil del afiliado.
                            await supabaseAdmin
                                .from('profiles')
                                .update({
                                    last_notification: `¡Felicidades! Tienes una nueva comisión acumulada de ${commissionAmount}€.`
                                })
                                .eq('id', (await supabaseAdmin.from('affiliates').select('user_id').eq('id', referral.affiliate_id).single()).data?.user_id)

                            console.log(`💰 Commission of ${commissionAmount}€ recorded for affiliate ${referral.affiliate_id}`)
                        }
                    }
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                const subscriptionId = invoice.subscription as string

                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'past_due' })
                    .eq('stripe_subscription_id', subscriptionId)

                console.log(`❌ Payment failed for subscription ${subscriptionId}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'expired' })
                    .eq('stripe_subscription_id', subscription.id)

                console.log(`🗑️ Subscription ${subscription.id} cancelled`)
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (err) {
        console.error(`💥 Webhook handler failed: ${err.message}`)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
