-- Add 'username' and 'country' columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add username
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username text;
    END IF;

    -- Add country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE public.profiles ADD COLUMN country text DEFAULT 'ES';
    END IF;
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
