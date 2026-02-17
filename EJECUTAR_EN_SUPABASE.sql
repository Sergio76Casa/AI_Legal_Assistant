-- MigraciÃ³n: Multi-Tenant "Iron Silo" Architecture
-- Fecha: 17 de Febrero, 2026
-- Objetivo: Aislamiento total de datos por OrganizaciÃ³n (Tenant)

-- 1. Crear Tabla de Tenants (Organizaciones)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Para subdominios o rutas: app.com/empresa
    plan_type TEXT DEFAULT 'free', -- 'free', 'pro', 'business'
    config JSONB DEFAULT '{}', -- Config visual (logo, colores)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en Tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- PolÃ­tica: Todos pueden VER tenants (necesario para login/registro)
-- En producciÃ³n estricta, esto se cerrarÃ­a mÃ¡s, pero para MVP es necesario.
CREATE POLICY "Public read access to tenants"
    ON public.tenants FOR SELECT
    USING (true);

-- 2. "Legacy Ark": Crear Tenant Global para datos existentes
-- Usamos un UUID fijo y conocido para evitar confusiones
INSERT INTO public.tenants (id, name, slug, plan_type)
VALUES ('00000000-0000-0000-0000-000000000000', 'Legal AI Global', 'global', 'business')
ON CONFLICT (id) DO UPDATE SET name = 'Legal AI Global'; -- Idempotency

-- 3. Inyectar `tenant_id` en tablas Core
-- Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- Knowledge Base (Vectores IA)
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- Chat Logs
ALTER TABLE public.chat_logs
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- Documents (Archivos)
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- 4. Actualizar Ãndices para Performance Multitenant
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant ON public.knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_tenant ON public.chat_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON public.documents(tenant_id);

-- 5. BLINDAJE RLS (Security Shield)
-- Actualizamos las polÃ­ticas para que SOLO dejen pasar si el tenant_id coincide

-- Profiles: Ver perfil propio Y pertenecer al mismo tenant (aunque auth.uid ya filtra por usuario, esto asegura integridad)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id); -- Mantenemos simple por ahora, ya que id = auth.uid es fuerte.

-- Knowledge Base: EL CAMBIO CRÃTICO
-- Antes: true (o solo auth). Ahora: Solo mi tenant O el Global.
DROP POLICY IF EXISTS "Authenticated users can read knowledge base" ON public.knowledge_base;
CREATE POLICY "Tenant Isolation Protocol"
    ON public.knowledge_base FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        OR 
        tenant_id = '00000000-0000-0000-0000-000000000000' -- Acceso a Documentos Globales Legales
        OR
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'service_role' -- Service Role siempre puede
    );

-- Documents: Similar a Knowledge Base
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Tenant Isolation - Documents"
    ON public.documents FOR SELECT
    USING (
        (auth.uid() = user_id) -- Propio dueÃ±o
        AND
        (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())) -- Mismo Tenant
    );

-- 6. FunciÃ³n RPC actualizada para BÃºsqueda (Fase 2 PreparaciÃ³n)
-- Actualizamos la firma pero mantenemos lÃ³gica compatible por defecto
DROP FUNCTION IF EXISTS match_documents;

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_user_id uuid DEFAULT NULL,
  p_tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000' -- Default a Global si no se pasa
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float,
  tenant_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) as similarity,
    k.tenant_id
  FROM knowledge_base k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
  AND (
      -- Aislamiento de Tenant:
      -- O es del tenant del usuario
      k.tenant_id = p_tenant_id
      OR
      -- O es contenido Global (Leyes pÃºblicas)
      k.tenant_id = '00000000-0000-0000-0000-000000000000'
  )
  AND (
      -- Privacidad de Usuario (dentro del Tenant):
      -- O es documento pÃºblico del tenant (user_id IS NULL)
      k.user_id IS NULL
      OR
      -- O es documento privado del usuario
      k.user_id = p_user_id
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
