-- 1. Habilitar RLS en Tenants (por seguridad básica)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas viejas
DROP POLICY IF EXISTS "Ver tenants propios" ON public.tenants;
DROP POLICY IF EXISTS "Superadmin ve todo tenants" ON public.tenants;
DROP POLICY IF EXISTS "Superadmin edita tenants" ON public.tenants;

-- 3. Política: Superadmin ve TODO
CREATE POLICY "Superadmin ve todo tenants"
ON public.tenants
FOR ALL
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

-- 4. Política: Usuario ve SU propio tenant (para info básica como nombre)
CREATE POLICY "Usuario ve su tenant"
ON public.tenants
FOR SELECT
USING (
    id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR
    id = '00000000-0000-0000-0000-000000000000' -- Todos ven el Global
);

-- 5. Crear Función RPC para que el Superadmin pueda cambiar PLANES
-- (Esto evita luchar contra RLS en updates complejos)
CREATE OR REPLACE FUNCTION public.update_tenant_plan(target_tenant_id uuid, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar si quien ejecuta es Superadmin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'superadmin'
    ) THEN
        RAISE EXCEPTION 'Solo Superadmins pueden cambiar planes';
    END IF;

    -- Actualizar el plan
    UPDATE public.tenants
    SET plan = new_plan, updated_at = now()
    WHERE id = target_tenant_id;
END;
$$;
