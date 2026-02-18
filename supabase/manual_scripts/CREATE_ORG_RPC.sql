-- Función para crear una nueva organización y asignar al usuario creador como Admin
-- Se llama DESPUÉS de que el usuario se ha registrado (auth.uid() existe)

CREATE OR REPLACE FUNCTION public.create_new_organization(
    org_name text,
    org_slug text DEFAULT NULL -- Si no se pasa, se genera
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta como superusuario para saltarse RLS estricto de tenants
AS $$
DECLARE
    new_tenant_id uuid;
    final_slug text;
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    -- Validar usuario
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Generar slug si no viene
    IF org_slug IS NULL OR org_slug = '' THEN
        final_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
    ELSE
        final_slug := org_slug;
    END IF;

    -- 1. Crear Tenant
    INSERT INTO public.tenants (name, slug, status, plan)
    VALUES (org_name, final_slug, 'active', 'free')
    RETURNING id INTO new_tenant_id;

    -- 2. Actualizar perfil del creador: Asignar Tenant y Rol Admin
    UPDATE public.profiles
    SET 
        tenant_id = new_tenant_id,
        role = 'admin'
    WHERE id = current_user_id;

    RETURN new_tenant_id;
END;
$$;
