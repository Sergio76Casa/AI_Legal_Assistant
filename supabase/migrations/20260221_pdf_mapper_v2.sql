-- Migration: PDF Mapper v2.0 - Fields Extension
-- Date: 2026-02-21

ALTER TABLE public.form_fields_mapping 
ADD COLUMN IF NOT EXISTS field_type TEXT DEFAULT 'text' CHECK (field_type IN ('text', 'checkbox')),
ADD COLUMN IF NOT EXISTS trigger_value TEXT;

-- Update RLS if needed (already broad enough from previous migration)
