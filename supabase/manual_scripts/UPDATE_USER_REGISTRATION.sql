-- 1. Añadir columna 'plan' a la tabla de perfiles (usuarios finales)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 2. Actualizar la función trigger para manejar registros con 'tenant_slug'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_tenant_id uuid;
  target_slug text;
  user_plan text;
BEGIN
  -- Obtener slug y plan desde los metadatos de Auth
  target_slug := new.raw_user_meta_data->>'tenant_slug';
  user_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');

  -- Si hay un slug, buscamos el tenant correspondiente
  IF target_slug IS NOT NULL THEN
    SELECT id INTO target_tenant_id FROM public.tenants WHERE slug = target_slug;
    
    -- Si encontramos el tenant, asignamos el usuario a ese tenant
    IF target_tenant_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, email, role, tenant_id, plan, username)
      VALUES (
        new.id,
        new.email,
        'member', -- Rol por defecto para usuarios finales
        target_tenant_id,
        user_plan,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
      );
      RETURN new;
    END IF;
  END IF;

  -- Si NO hay slug (registro normal como dueño de org) o no se encuentra el tenant
  -- Creamos el perfil sin tenant (se asignará luego al crear org) o con tenant por defecto si aplica
  INSERT INTO public.profiles (id, email, role, tenant_id, plan, username)
  VALUES (
    new.id,
    new.email,
    'user', -- Rol temporal hasta que cree org
    NULL,
    'free',
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  RETURN new;
END;
$$;
