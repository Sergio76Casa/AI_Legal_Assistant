-- 1. Tabla de Plantillas PDF (Templates)
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    storage_path TEXT NOT NULL, -- Ruta en el bucket 'templates'
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Mapeo de Campos (Coordenadas)
CREATE TABLE IF NOT EXISTS public.form_fields_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL, -- Clave del dato: 'first_name', 'nie', 'address'
    page_number INTEGER NOT NULL DEFAULT 1,
    x_coordinate FLOAT NOT NULL, -- Coordenadas en Puntos PDF (72 DPI usualmente)
    y_coordinate FLOAT NOT NULL,
    width FLOAT,
    height FLOAT,
    font_size INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_pdf_templates_tenant ON public.pdf_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_template ON public.form_fields_mapping(template_id);

-- 4. Habilitar RLS
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields_mapping ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Seguridad (RLS)

-- A. Templates:
-- Leer: Admins y Users del mismo Tenant (Users para generar, Admins para editar)
CREATE POLICY "Tenant members can view templates"
ON public.pdf_templates FOR SELECT
USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Escribir (Insert/Update/Delete): Solo Admins del Tenant
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

-- B. Mappings:
-- Leer: Igual que templates
CREATE POLICY "Tenant members can view mappings"
ON public.form_fields_mapping FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pdf_templates t
        WHERE t.id = template_id
        AND t.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
);

-- Escribir: Solo Admins (A través del template padre)
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
