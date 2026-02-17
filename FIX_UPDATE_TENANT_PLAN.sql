-- Create or replace the function to update tenant plan
CREATE OR REPLACE FUNCTION public.update_tenant_plan(
    target_tenant_id uuid,
    new_plan text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the user is a superadmin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'superadmin'
    ) THEN
        RAISE EXCEPTION 'Solo Superadmins pueden cambiar planes';
    END IF;

    -- Update the plan
    UPDATE public.tenants
    SET plan = new_plan, updated_at = now()
    WHERE id = target_tenant_id;
END;
$$;

-- Grant execute permission to authenticated users (so they can call it, check happens inside)
GRANT EXECUTE ON FUNCTION public.update_tenant_plan(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_tenant_plan(uuid, text) TO service_role;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
