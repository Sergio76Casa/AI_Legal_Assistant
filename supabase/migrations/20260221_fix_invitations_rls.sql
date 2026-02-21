-- Migration: Fix invitation RLS and logic
-- Date: 2026-02-21

ALTER TABLE public.tenant_invitations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add UPDATE policy to tenant_invitations if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tenant_invitations' 
        AND policyname = 'Admins actualizan invitaciones'
    ) THEN
        CREATE POLICY "Admins actualizan invitaciones"
        ON public.tenant_invitations
        FOR UPDATE
        USING (
            (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
            AND
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
            OR
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        );
    END IF;
END $$;
