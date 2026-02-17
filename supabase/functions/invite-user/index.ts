import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, tenant_id, role = 'user' } = await req.json();

        // 1. Create Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // 2. Auth Check: Ensure req.user exists
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) throw new Error('Unauthorized');

        // 3. Permission Check: Is the inviter ADMIN of this tenant? (or Superadmin)
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single();

        const isSuperadmin = profile.role === 'superadmin';
        const isTenantAdmin = profile.role === 'admin' && profile.tenant_id === tenant_id;

        if (!isSuperadmin && !isTenantAdmin) {
            return new Response(JSON.stringify({ error: 'No permission to invite users to this tenant' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Create Invitation Record
        // Note: We use Service Role Key here to bypass RLS for inserting if needed, 
        // but standard client + RLS policies SHOULD work if set correctly. 
        // For robustness, let's stick to standard client first.
        const { data: invite, error: inviteError } = await supabaseClient
            .from('tenant_invitations')
            .insert({
                email,
                tenant_id,
                role,
                invited_by: user.id
            })
            .select()
            .single();

        if (inviteError) throw inviteError;

        // 5. Send Email (Simulation / Future integration with Resend)
        console.log(`[SIM] Invitation Email sent to ${email} for Tenant ${tenant_id}. Token: ${invite.token}`);

        // In a real scenario, here we would call RESEND API:
        // await resend.emails.send({ to: email, subject: 'Join our Team', html: `<a href="...?token=${invite.token}">Join</a>` })

        return new Response(JSON.stringify({
            success: true,
            message: 'Invitation created',
            invite_token: invite.token // Returned for debug/manual sharing
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
