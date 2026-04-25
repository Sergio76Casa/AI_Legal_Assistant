import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { document_id, file_path, bucket_id = 'legal-global' } = await req.json()

        if (!document_id || !file_path) {
            return new Response(
                JSON.stringify({ error: 'Missing document_id or file_path' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            { auth: { persistSession: false } }
        )

        // Verificar que el llamante es superadmin
        const authHeader = req.headers.get('authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No autorizado.' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Token inválido.' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        if (profile?.role !== 'superadmin') {
            return new Response(
                JSON.stringify({ error: 'Acceso denegado. Solo superadmins pueden eliminar documentos globales.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`=== DELETE-DOCUMENT === id:${document_id} path:${file_path} bucket:${bucket_id}`)

        // 1. Borrar fragmentos de knowledge_base
        const { error: kbError, count: kbCount } = await supabase
            .from('knowledge_base')
            .delete({ count: 'exact' })
            .eq('metadata->>source', file_path)

        if (kbError) console.error('KB delete error:', kbError.message)
        else console.log(`KB: ${kbCount} fragmentos eliminados.`)

        // 2. Borrar archivo de Storage
        const { error: storageError } = await supabase.storage
            .from(bucket_id)
            .remove([file_path])

        if (storageError) console.error('Storage delete error:', storageError.message)
        else console.log(`Storage: archivo eliminado.`)

        // 3. Borrar registro del documento (al final para que no quede huérfano si falla algo antes)
        const { error: docError } = await supabase
            .from('documents')
            .delete()
            .eq('id', document_id)

        if (docError) throw new Error(`Error al eliminar documento: ${docError.message}`)
        console.log(`Documento ${document_id} eliminado de BD.`)

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (e: any) {
        console.error('=== DELETE-DOCUMENT ERROR ===', e.message)
        return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
