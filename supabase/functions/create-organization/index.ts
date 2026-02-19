import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, orgName, username, country_code, referral_code } = await req.json()

    // Create Supabase client with Service Role Key (Admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Lookup affiliate if referral code is provided
    let referredById = null;
    if (referral_code) {
      const { data: affiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', referral_code)
        .eq('status', 'active') // Only active affiliates can refer
        .maybeSingle();

      if (affiliate) {
        referredById = affiliate.id;
      }
    }

    // 1. Create Tenant
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: orgName,
        slug: slug,
        plan: 'free',
        status: 'active',
        referred_by: referredById // Link to affiliate
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    // 2. Create User (Admin Auth) - Auto Confirm email for seamless onboarding
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        country: country_code || 'ES',
        // Critical: Set tenant_id directly in metadata for consistency,
        // though we update profile manually next to be sure.
        tenant_id: tenant.id,
        role: 'admin'
      }
    })

    if (userError) {
      // Rollback: Delete tenant if user creation fails
      await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
      throw userError
    }

    const userId = userData.user.id

    // 3. Update Profile with Correct Tenant ID & Role
    // The trigger 'handle_new_user' likely ran on user creation and created a profile with default/null tenant.
    // We must overwrite it now.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        tenant_id: tenant.id,
        role: 'admin',
        username: username,
        country: country_code || 'ES'
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      // Non-critical (?) but highly problematic.
      throw new Error('Error assigning admin role: ' + profileError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user,
        tenant: tenant,
        message: 'Organization created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // Return 200 even on error so client can read the message easily
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
