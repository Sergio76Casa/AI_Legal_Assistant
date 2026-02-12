-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  plan_type text check (plan_type in ('free', 'premium')) default 'free',
  query_count int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create knowledge_base table for RAG
create table knowledge_base (
  id bigserial primary key,
  content text,
  embedding vector(768), -- Dimensions for text-embedding-004
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create chat_logs table
create table chat_logs (
  id bigserial primary key,
  user_id uuid references auth.users, -- Can be null for anonymous users if allowed, or specific user
  channel text check (channel in ('web', 'telegram')),
  message text,
  ai_response text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create match_documents function for cosine similarity search
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
