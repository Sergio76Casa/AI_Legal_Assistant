-- INSPECCIONAR SCHEMA DE DOCUMENTS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';
