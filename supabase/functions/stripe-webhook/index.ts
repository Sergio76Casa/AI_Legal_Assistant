// Follow this setup guide to integrate the Deno runtime.
// https://deno.land/manual/getting_started/setup_your_environment
// This function handles Stripe webhooks to update user plan_type.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()

    try {
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
            undefined,
            cryptoProvider
        )

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const { customer_email, client_reference_id } = session

            // Ideally pass user_id in client_reference_id during checkout creation
            const userId = client_reference_id;

            if (userId) {
                const supabase = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                )

                await supabase
                    .from('profiles')
                    .update({ plan_type: 'premium' })
                    .eq('id', userId)
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        return new Response(err.message, { status: 400 })
    }
})
