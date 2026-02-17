-- REPARACIÓN: Añadir columna country a la tabla profiles
-- Ejecutar en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/lkdfesfidxkaolcetseq/sql/new

-- 1. Añadir columna country a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'ES';

-- 2. Actualizar todos los usuarios existentes con España como región por defecto
UPDATE profiles 
SET country = 'ES' 
WHERE country IS NULL;

-- 3. Crear índice para búsquedas por país
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- 4. Añadir comentario explicativo
COMMENT ON COLUMN profiles.country IS 'ISO 3166-1 alpha-2 country code (e.g., ES, FR, GB, MA, PK, CN, etc.)';

-- 5. Verificar que se aplicó correctamente
SELECT id, email, country FROM profiles LIMIT 10;
