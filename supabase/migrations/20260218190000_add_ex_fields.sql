-- Migration: Add Fields for EX-15 and EX-18 Forms
-- Date: 2026-02-18

ALTER TABLE public.profiles
-- Identity
ADD COLUMN IF NOT EXISTS passport_num TEXT,
ADD COLUMN IF NOT EXISTS civil_status TEXT, -- S/C/V/D/Sp

-- Filiation
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT,

-- Address in Spain (Granular)
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS address_floor TEXT,
ADD COLUMN IF NOT EXISTS address_province TEXT,
-- Note: 'city' (localidad) and 'postal_code' (cp) already exist in previous migration

-- Representation
ADD COLUMN IF NOT EXISTS representative_name TEXT,
ADD COLUMN IF NOT EXISTS representative_nie TEXT;
