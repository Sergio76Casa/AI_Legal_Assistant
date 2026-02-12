-- 1. Enable pgvector if not enabled
create extension if not exists vector;

-- 2. Update knowledge_base table
-- We alter the column to ensure it is vector(768). 
-- This might fail if there is data with different dimensions.
-- If so, we might need to truncate or delete data.
-- "gemini-embedding-001" and "text-embedding-004" both output 768 dimensions.

-- Safely drop the function first because it depends on the type
drop function if exists match_documents;

-- Alter the table
alter table knowledge_base 
alter column embedding type vector(768);

-- 3. Recreate the function with correct signature
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
