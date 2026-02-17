-- PRUEBA NUCLEAR: DESACTIVAR SEGURIDAD (RLS)
-- Esto confirmará si el problema es de permisos o de otra cosa.

-- 1. Desactivar RLS temporalmente en documents
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- 2. Verificar (Esto debería devolver 13 si hay 13 docs)
SELECT count(*) FROM public.documents;
