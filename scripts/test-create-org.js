
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateOrg() {
    console.log('Testing create-organization with plan: pro');

    const testData = {
        email: `test-${Math.random().toString(36).substring(7)}@example.com`,
        password: 'password123',
        orgName: 'Test Org Pro ' + Math.floor(Math.random() * 1000),
        username: 'testadmin',
        plan: 'pro'
    };

    try {
        const { data, error } = await supabase.functions.invoke('create-organization', {
            body: testData
        });

        if (error) {
            console.error('Function execution error:', error);
            return;
        }

        console.log('Result:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('SUCCESS: Organization created with plan:', data.tenant.plan);
        } else {
            console.error('FAILURE:', data.error);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testCreateOrg();
