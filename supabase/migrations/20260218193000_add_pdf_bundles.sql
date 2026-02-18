-- Migration: Add PDF Bundles (Packs)
-- Date: 2026-02-18

-- 1. Create Bundles Table
CREATE TABLE IF NOT EXISTS public.pdf_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'immigration', 'business', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Bundle-Templates Association Table
CREATE TABLE IF NOT EXISTS public.bundle_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.pdf_bundles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bundle_id, template_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_pdf_bundles_tenant ON public.pdf_bundles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bundle_templates_bundle ON public.bundle_templates(bundle_id);

-- 4. Enable RLS
ALTER TABLE public.pdf_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_templates ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Bundles: Tenant members can view
CREATE POLICY "Tenant members can view bundles"
ON public.pdf_bundles FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    OR 
    tenant_id = '00000000-0000-0000-0000-000000000000'
);

-- Bundles: Admins can manage
CREATE POLICY "Admins can manage bundles"
ON public.pdf_bundles FOR ALL
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

-- Bundle Templates: Tenant members can view
CREATE POLICY "Tenant members can view bundle templates"
ON public.bundle_templates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pdf_bundles b
        WHERE b.id = bundle_id
        AND (
            b.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
            OR
            b.tenant_id = '00000000-0000-0000-0000-000000000000'
        )
    )
);

-- Bundle Templates: Admins can manage
CREATE POLICY "Admins can manage bundle templates"
ON public.bundle_templates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.pdf_bundles b
        JOIN public.profiles p ON p.tenant_id = b.tenant_id
        WHERE b.id = bundle_id
        AND p.id = auth.uid()
        AND (p.role = 'admin' OR p.role = 'superadmin')
    )
);
