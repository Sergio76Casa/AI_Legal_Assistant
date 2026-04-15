
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const tables = ['profiles', 'tenants', 'affiliates', 'affiliate_referrals', 'affiliate_commissions']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`Table [${table}]: ERROR - ${error.message} (Code: ${error.code})`)
    } else {
      console.log(`Table [${table}]: OK`)
    }
  }
}

check()
