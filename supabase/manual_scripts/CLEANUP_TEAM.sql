-- Borrar todos los perfiles EXCEPTO los dos sagrados
DELETE FROM public.profiles
WHERE email NOT IN ('lsergiom76@gmail.com', 'testuser@example.com');

-- (Opcional) Limpiar invitaciones pendientes de gente que hemos borrado
DELETE FROM public.tenant_invitations
WHERE email NOT IN ('lsergiom76@gmail.com', 'testuser@example.com');
