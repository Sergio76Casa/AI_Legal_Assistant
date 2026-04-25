-- PREFLIGHT CLEANUP: Elimina todas las policies que podrían existir ya en la BD
-- antes de que las migraciones intenten crearlas de nuevo.
-- Corre ANTES que todas las demás migraciones (timestamp 20260210).
-- Cada bloque DO captura el error silenciosamente si la tabla aún no existe.

-- ── profiles ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil"     ON public.profiles;
  DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own profile"               ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── documents ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own documents"  ON public.documents;
  DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
  DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
  DROP POLICY IF EXISTS "Tenant Isolation - Documents"         ON public.documents;
  DROP POLICY IF EXISTS "Users can view own documents"         ON public.documents;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── knowledge_base ────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own knowledge chunks"   ON public.knowledge_base;
  DROP POLICY IF EXISTS "Users can insert their own knowledge chunks" ON public.knowledge_base;
  DROP POLICY IF EXISTS "Users can delete their own knowledge chunks" ON public.knowledge_base;
  DROP POLICY IF EXISTS "Authenticated users can read knowledge base" ON public.knowledge_base;
  DROP POLICY IF EXISTS "Tenant Isolation Protocol"                   ON public.knowledge_base;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── tenants ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access to tenants" ON public.tenants;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── pdf_templates ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tenant members can view templates" ON public.pdf_templates;
  DROP POLICY IF EXISTS "Admins can manage templates"       ON public.pdf_templates;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── form_fields_mapping ───────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tenant members can view mappings" ON public.form_fields_mapping;
  DROP POLICY IF EXISTS "Admins can manage mappings"       ON public.form_fields_mapping;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── pdf_bundles ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tenant members can view bundles"          ON public.pdf_bundles;
  DROP POLICY IF EXISTS "Admins can manage bundles"                ON public.pdf_bundles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── bundle_templates ──────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tenant members can view bundle templates" ON public.bundle_templates;
  DROP POLICY IF EXISTS "Admins can manage bundle templates"       ON public.bundle_templates;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── document_signature_requests ───────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view signature requests"   ON public.document_signature_requests;
  DROP POLICY IF EXISTS "Clients can view own signature requests" ON public.document_signature_requests;
  DROP POLICY IF EXISTS "Admins can create signature requests" ON public.document_signature_requests;
  DROP POLICY IF EXISTS "Clients can sign own requests"        ON public.document_signature_requests;
  DROP POLICY IF EXISTS "Admins can manage signature requests" ON public.document_signature_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── document_signature_logs ───────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view signature logs"         ON public.document_signature_logs;
  DROP POLICY IF EXISTS "Clients can view own signature logs"    ON public.document_signature_logs;
  DROP POLICY IF EXISTS "Authenticated can create signature logs" ON public.document_signature_logs;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── organization_settings ─────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read organization_settings" ON public.organization_settings;
  DROP POLICY IF EXISTS "Admin manage organization_settings" ON public.organization_settings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── affiliate_referrals ───────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own referrals" ON public.affiliate_referrals;
  DROP POLICY IF EXISTS "Admins can view all referrals"     ON public.affiliate_referrals;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── affiliate_commissions ─────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Affiliates can view own commissions" ON public.affiliate_commissions;
  DROP POLICY IF EXISTS "Admins can view all commissions"     ON public.affiliate_commissions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── app_settings ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read app_settings"      ON public.app_settings;
  DROP POLICY IF EXISTS "Superadmin manage app_settings" ON public.app_settings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── subscriptions ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own subscription"      ON public.subscriptions;
  DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── usage_tracking ────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── tenant_law_settings ───────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Tenant admin manages own law settings" ON public.tenant_law_settings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── storage.objects ───────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view templates"  ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload templates"             ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete templates"             ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can view signatures" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;
  DROP POLICY IF EXISTS "Allow anonymous signature uploads"       ON storage.objects;
  DROP POLICY IF EXISTS "Allow anonymous signature downloads"     ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
