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

        // 1. Create Supabase Client with SERVICE ROLE for DB operations
        // This allows the function to manage invitations regardless of RLS, 
        // but we will still check permissions manually below.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 2. Create a separate client for the user to verify their identity
        const userClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) throw new Error('ERROR_UNAUTHORIZED');

        // 3. Permission Check: Is the inviter ADMIN of this tenant? (or Superadmin)
        // We use supabaseAdmin here to ensure we can read the profile even if RLS is tight
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            throw new Error('ERROR_PROFILE_NOT_FOUND');
        }

        const isSuperadmin = profile.role === 'superadmin';
        const isTenantAdmin = profile.role === 'admin' && profile.tenant_id === tenant_id;

        if (!isSuperadmin && !isTenantAdmin) {
            console.warn(`User ${user.id} (role: ${profile.role}, tenant: ${profile.tenant_id}) attempted to invite to ${tenant_id}`);
            return new Response(JSON.stringify({ error: 'ERROR_FORBIDDEN' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Check if user is already a member of THIS tenant
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .eq('tenant_id', tenant_id)
            .maybeSingle();

        if (existingProfile) {
            return new Response(JSON.stringify({ error: 'ERROR_ALREADY_MEMBER' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 5. Create or Update Invitation Record (Manual check to avoid constraint violation)
        const newToken = crypto.randomUUID().replace(/-/g, '');

        const { data: existingInvite } = await supabaseAdmin
            .from('tenant_invitations')
            .select('id')
            .eq('email', email)
            .eq('tenant_id', tenant_id)
            .maybeSingle();

        let invite;
        let inviteError;

        if (existingInvite) {
            const { data: updated, error: updErr } = await supabaseAdmin
                .from('tenant_invitations')
                .update({
                    token: newToken,
                    status: 'pending',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('id', existingInvite.id)
                .select()
                .single();
            invite = updated;
            inviteError = updErr;
        } else {
            const { data: inserted, error: insErr } = await supabaseAdmin
                .from('tenant_invitations')
                .insert({
                    email,
                    tenant_id,
                    role,
                    invited_by: user.id,
                    token: newToken,
                    status: 'pending'
                })
                .select()
                .single();
            invite = inserted;
            inviteError = insErr;
        }

        if (inviteError) {
            console.error('Invitation operation error:', inviteError);
            throw inviteError;
        }

        console.log(`Success: Invitation created for ${email}. Token: ${invite.token}`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Invitation created',
            invite_token: invite.token
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Global Function Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
