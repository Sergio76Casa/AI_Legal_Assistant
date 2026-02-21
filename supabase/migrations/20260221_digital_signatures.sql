-- Migration: Digital Signatures System
-- Date: 2026-02-21
-- Description: Adds signature request tracking, audit logging, and extends field types

-- 1. UPDATE form_fields_mapping to support 'signature' field type
ALTER TABLE public.form_fields_mapping
DROP CONSTRAINT IF EXISTS form_fields_mapping_field_type_check;

ALTER TABLE public.form_fields_mapping
ADD CONSTRAINT form_fields_mapping_field_type_check 
CHECK (field_type IN ('text', 'checkbox', 'signature'));

-- 2. CREATE SIGNATURE REQUESTS TABLE
-- Tracks documents sent for signature
CREATE TABLE IF NOT EXISTS public.document_signature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'expired', 'cancelled')),
    -- Pre-generated PDF stored in storage
    document_storage_path TEXT,
    signed_document_path TEXT,
    -- Token for public access (no auth required)
    access_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    -- Metadata
    document_name TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE SIGNATURE AUDIT LOG TABLE
-- Stores the certificate of signature for legal validity
CREATE TABLE IF NOT EXISTS public.document_signature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signature_request_id UUID NOT NULL REFERENCES public.document_signature_requests(id) ON DELETE CASCADE,
    signer_user_id UUID REFERENCES auth.users(id),
    signer_name TEXT NOT NULL,
    signer_email TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    -- Signature data
    signature_hash TEXT NOT NULL, -- SHA-256 hash of the signature image
    signature_storage_path TEXT,  -- Path to stored signature PNG
    -- Document integrity
    document_hash_before TEXT,    -- Hash of PDF before signing
    document_hash_after TEXT,     -- Hash of PDF after signing
    -- Timestamps
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_sig_requests_tenant ON public.document_signature_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sig_requests_client ON public.document_signature_requests(client_user_id);
CREATE INDEX IF NOT EXISTS idx_sig_requests_token ON public.document_signature_requests(access_token);
CREATE INDEX IF NOT EXISTS idx_sig_requests_status ON public.document_signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_sig_logs_request ON public.document_signature_logs(signature_request_id);

-- 5. ENABLE RLS
ALTER TABLE public.document_signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signature_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR SIGNATURE REQUESTS

-- Admins of the tenant can view all signature requests
CREATE POLICY "Admins can view signature requests"
ON public.document_signature_requests FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

-- Clients can view their own signature requests
CREATE POLICY "Clients can view own signature requests"
ON public.document_signature_requests FOR SELECT
USING (client_user_id = auth.uid());

-- Admins can create signature requests
CREATE POLICY "Admins can create signature requests"
ON public.document_signature_requests FOR INSERT
WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

-- Clients can update (sign) their own pending requests
CREATE POLICY "Clients can sign own requests"
ON public.document_signature_requests FOR UPDATE
USING (client_user_id = auth.uid() AND status = 'pending')
WITH CHECK (client_user_id = auth.uid());

-- Admins can manage (cancel) signature requests
CREATE POLICY "Admins can manage signature requests"
ON public.document_signature_requests FOR ALL
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
    )
);

-- 7. RLS POLICIES FOR SIGNATURE LOGS

-- Admins can view all logs for their tenant
CREATE POLICY "Admins can view signature logs"
ON public.document_signature_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.document_signature_requests r
        JOIN public.profiles p ON p.tenant_id = r.tenant_id
        WHERE r.id = signature_request_id
        AND p.id = auth.uid()
        AND (p.role = 'admin' OR p.role = 'superadmin')
    )
);

-- Clients can view logs for their own signatures
CREATE POLICY "Clients can view own signature logs"
ON public.document_signature_logs FOR SELECT
USING (signer_user_id = auth.uid());

-- Anyone authenticated can insert a log (during signing process)
CREATE POLICY "Authenticated can create signature logs"
ON public.document_signature_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 8. STORAGE: Create bucket for signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'signatures',
    'signatures',
    false,
    5242880, -- 5MB limit
    ARRAY['image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for signatures bucket
CREATE POLICY "Authenticated users can view signatures"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'signatures' AND auth.role() = 'authenticated');
