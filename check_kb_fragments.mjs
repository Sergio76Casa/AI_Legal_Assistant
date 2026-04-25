import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''; // Needs actual env vars

// We will read the .env file
import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const envLines = envContent.split('\n');
let url = '';
let key = '';
for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

console.log("URL:", url);
const supabase = createClient(url, key);

async function check() {
    const { data: allDocs, error } = await supabase
        .from('knowledge_base')
        .select('id, tenant_id, user_id, metadata');
    
    if (error) {
        console.error("Error", error);
        return;
    }

    console.log(`Total fragments: ${allDocs.length}`);
    
    let globalCount = 0;
    let nullTenantCount = 0;
    let userMatches = {};

    allDocs.forEach(d => {
        if (d.tenant_id === '00000000-0000-0000-0000-000000000000') globalCount++;
        if (d.tenant_id === null) nullTenantCount++;

        const uid = d.user_id || 'null';
        userMatches[uid] = (userMatches[uid] || 0) + 1;
    });

    console.log(`Global Tenant (0000...):`, globalCount);
    console.log(`NULL Tenant:`, nullTenantCount);
    console.log(`User ID breakdown:`, userMatches);
}

check();
