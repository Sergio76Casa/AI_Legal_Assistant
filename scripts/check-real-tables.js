
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('--- Checking available tables in public schema ---')
  const { data, error } = await supabase.rpc('match_knowledge', { 
    query_embedding: Array(768).fill(0), 
    match_threshold: 0, 
    match_count: 1 
  })
  
  // Since we can't easily query information_schema via standard Supabase client 
  // without a custom RPC, let's try to just perform a direct select to see 
  // if we can find ANY table.
  
  const tables = ['profiles', 'tenants', 'affiliates', 'affiliate_referrals', 'affiliate_commissions', 'subscriptions', 'usage_tracking']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.log(`Table [${table}]: MISSING (${error.message})`)
    } else {
      console.log(`Table [${table}]: EXISTS`)
    }
  }
}

check()
