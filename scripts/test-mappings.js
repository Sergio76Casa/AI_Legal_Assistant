import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: reqs, error } = await supabase.from('document_signature_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) console.error(error);
    console.log('Recent requests:', reqs?.map(r => ({ id: r.id, name: r.document_name, template_id: r.template_id, status: r.status })));

    if (reqs && reqs.length > 0) {
        for (const r of reqs) {
            if (r.template_id) {
                const { data: mappings } = await supabase.from('form_fields_mapping').select('*').eq('template_id', r.template_id);
                console.log(`Mappings for ${r.document_name}:`, mappings?.length);
            }
        }
    }
}
check();
