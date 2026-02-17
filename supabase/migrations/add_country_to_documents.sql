-- Migración: Añadir soporte multi-región a documentos
-- Fecha: 2026-02-14
-- Descripción: Añade campo country a la tabla documents para filtrar por región

-- Añadir columna country a la tabla documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'ES';

-- Crear índice para búsquedas por país
CREATE INDEX IF NOT EXISTS idx_documents_country ON documents(country);

-- Añadir comentario
COMMENT ON COLUMN documents.country IS 'ISO 3166-1 alpha-2 country code (e.g., ES, FR, GB, MA, PK, CN, etc.)';

-- Actualizar documentos existentes con país por defecto
UPDATE documents 
SET country = 'ES' 
WHERE country IS NULL;
