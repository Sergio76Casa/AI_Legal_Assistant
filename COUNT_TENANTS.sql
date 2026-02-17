-- Count tenants and list them with their created dates
SELECT COUNT(*) as "Total Tenants" FROM public.tenants;

SELECT id, name, created_at, plan FROM public.tenants ORDER BY created_at DESC;
