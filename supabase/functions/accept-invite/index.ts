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
    const { token, user_id } = await req.json();

    // 1. Create Supabase Client (Service Role - to manage sensitive data)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Validate Invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('tenant_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) throw new Error('Invitación inválida o expirada');

    // 3. Assign User to Tenant (Update Profile)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tenant_id: invitation.tenant_id,
        role: invitation.role,
        // Optional: Mark email verified if trusted invite
      })
      .eq('id', user_id);

    if (updateError) throw updateError;

    // 4. Mark Invitation as Accepted
    await supabaseAdmin
      .from('tenant_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
