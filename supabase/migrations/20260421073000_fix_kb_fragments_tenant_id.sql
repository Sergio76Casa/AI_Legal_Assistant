-- Fix inconsistent data for global documents in knowledge_base
UPDATE public.knowledge_base kb
SET tenant_id = '00000000-0000-0000-0000-000000000000'
FROM public.documents d
WHERE kb.metadata->>'source' = d.url
AND d.tenant_id = '00000000-0000-0000-0000-000000000000'
AND (kb.tenant_id IS NULL OR kb.tenant_id != '00000000-0000-0000-0000-000000000000');

-- We also make sure chunks for a specific tenant document have the right tenant_id
UPDATE public.knowledge_base kb
SET tenant_id = d.tenant_id
FROM public.documents d
WHERE kb.metadata->>'source' = d.url
AND d.tenant_id != '00000000-0000-0000-0000-000000000000'
AND (kb.tenant_id IS NULL OR kb.tenant_id != d.tenant_id);

-- Drop the old permissive policy that gave superadmins a false sense of visibility on malformed rows
DROP POLICY IF EXISTS "Users can view their own knowledge chunks" ON public.knowledge_base;
