-- 1. Tabla de Invitaciones
CREATE TABLE public.tenant_invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    invited_by uuid REFERENCES auth.users(id),
    token text DEFAULT encode(gen_random_bytes(32), 'hex'),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '7 days'),
    UNIQUE(tenant_id, email)
);

-- 2. Habilitar RLS
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad (RLS)

-- A. Ver invitaciones: Solo admins del mismo tenant o Superadmins
CREATE POLICY "Admins ven invitaciones de su tenant"
ON public.tenant_invitations
FOR SELECT
USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    
    OR
    
    -- Superadmin ve todo
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

-- B. Crear invitaciones: Solo admins del tenant
CREATE POLICY "Admins crean invitaciones para su tenant"
ON public.tenant_invitations
FOR INSERT
WITH CHECK (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    
    OR
    
    -- Superadmin puede invitar a cualquiera
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

-- C. Borrar invitaciones: Solo admins del tenant
CREATE POLICY "Admins borran invitaciones"
ON public.tenant_invitations
FOR DELETE
USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    
    OR
    
    -- Superadmin borra cualquiera
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);
