import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMappings() {
    const { data: request } = await supabase
        .from('document_signature_requests')
        .select('*, pdf_templates(*)')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!request || request.length === 0) {
        console.log('No recent requests found.');
        return;
    }

    const req = request[0];
    console.log('Last Request:', req.id, 'Template ID:', req.template_id);

    if (req.template_id) {
        const { data: mappings } = await supabase
            .from('form_fields_mapping')
            .select('*')
            .eq('template_id', req.template_id);

        console.log('Mappings for this template count:', mappings?.length);
        if (mappings && mappings.length > 0) {
            console.log('Mappings types:', mappings.map(m => m.field_key));
        }
    } else {
        console.log('No template ID on this request.');
    }
}

checkMappings();
