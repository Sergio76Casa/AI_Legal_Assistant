-- DIAGNOSTICO COMPLETO
-- Ejecuta esto para ver qué está pasando realmente

-- 1. Ver qué rol tienes actualmente (auth.uid() no funciona directo en select simple a veces en editor SQL puro, mejor usar auth.users)
-- Pero en Supabase SQL Editor, auth.uid() suele funcionar.

SELECT auth.uid() as my_id, 
       email, 
       role 
FROM auth.users 
WHERE id = auth.uid();

-- 2. Ver tu perfil público (donde guardamos el rol 'superadmin')
SELECT * FROM public.profiles WHERE id = auth.uid();

-- 3. Ver TODOS los documentos (sin importar tenant, si eres admin DB)
SELECT count(*) as total_docs FROM public.documents;

-- 4. Ver documentos Globales
SELECT count(*) as global_docs FROM public.documents WHERE tenant_id = '00000000-0000-0000-0000-000000000000';

-- 5. FORZAR REPARACIÓN: Asignar tu usuario como Superadmin
UPDATE public.profiles
SET role = 'superadmin'
WHERE id = auth.uid();

-- 6. FORZAR REPARACIÓN: Mover todos los docs huérfanos al Global
UPDATE public.documents
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- 7. IMPORTANTE: Asegurate que tu usuario pertenezca al Tenant Global
UPDATE public.profiles
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE id = auth.uid() AND (tenant_id IS NULL OR tenant_id != '00000000-0000-0000-0000-000000000000');
