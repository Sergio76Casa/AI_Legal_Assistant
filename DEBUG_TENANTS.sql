-- 1. Ver qué Tenants existen realmente
SELECT * FROM public.tenants;

-- 2. Ver la politica RLS de tenants para saber por qué no las ves
SELECT * FROM pg_policies WHERE tablename = 'tenants';

-- 3. Ver tus permisos actuales
SELECT * FROM public.profiles WHERE id = auth.uid();
