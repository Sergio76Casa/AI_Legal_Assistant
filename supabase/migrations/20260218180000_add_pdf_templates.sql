-- Migration: Visual PDF Mapper & Profiles Extension
-- Date: 2026-02-18

-- 1. EXTEND PROFILES (Client Data Fields)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS nie TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. CREATE PDF TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    storage_path TEXT NOT NULL, -- Path in 'templates' bucket
    category TEXT, -- 'immigration', 'taxes', etc.
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE FORM FIELDS MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.form_fields_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL, -- e.g., 'first_name', 'nie'
    page_number INTEGER NOT NULL DEFAULT 1,
    x_coordinate FLOAT NOT NULL, -- PDF Point coordinates (72 DPI)
    y_coordinate FLOAT NOT NULL,
    width FLOAT,
    height FLOAT,
    font_size INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_pdf_templates_tenant ON public.pdf_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_template ON public.form_fields_mapping(template_id);

-- 5. ENABLE RLS
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields_mapping ENABLE ROW LEVEL SECURITY;

-- 6. SECURITY POLICIES (Templates)

-- View: Tenant members
CREATE POLICY "Tenant members can view templates"
ON public.pdf_templates FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    OR 
    tenant_id = '00000000-0000-0000-0000-000000000000' -- Global templates
);

-- Manage: Tenant Admins
CREATE POLICY "Admins can manage templates"
ON public.pdf_templates FOR ALL
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

-- 7. SECURITY POLICIES (Mappings)

-- View: Tenant members
CREATE POLICY "Tenant members can view mappings"
ON public.form_fields_mapping FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pdf_templates t
        WHERE t.id = template_id
        AND (
            t.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
            OR
            t.tenant_id = '00000000-0000-0000-0000-000000000000'
        )
    )
);

-- Manage: Tenant Admins
CREATE POLICY "Admins can manage mappings"
ON public.form_fields_mapping FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.pdf_templates t
        JOIN public.profiles p ON p.tenant_id = t.tenant_id
        WHERE t.id = template_id
        AND p.id = auth.uid()
        AND (p.role = 'admin' OR p.role = 'superadmin')
    )
);

-- 8. STORAGE BUCKET CONFIGURATION
-- We try to insert the bucket. If it exists, we skip.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'templates', 
    'templates', 
    false, 
    10485760, -- 10MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can view templates"
ON storage.objects FOR SELECT
USING ( bucket_id = 'templates' AND auth.role() = 'authenticated' );

CREATE POLICY "Admins can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'templates' 
    AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

CREATE POLICY "Admins can delete templates"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'templates' 
    AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);
