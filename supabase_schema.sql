-- Habilitar extensión Vector para embeddings
create extension if not exists vector;

-- Tabla de Perfiles de Usuario
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  plan_type text default 'free',
  query_count int default 0,
  created_at timestamptz default now()
);

-- Tabla de Base de Conocimiento (RAG)
create table knowledge_base (
  id bigint primary key generated always as identity,
  content text,
  metadata jsonb,
  embedding vector(768) -- Dimensión para Google text-embedding-004
);

-- Tabla de Logs de Chat
create table chat_logs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users,
  channel text check (channel in ('web', 'telegram')),
  message text,
  ai_response text,
  created_at timestamptz default now()
);

-- Función RPC para buscar documentos similares
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

-- Políticas de Seguridad RLS (Row Level Security)
alter table profiles enable row level security;
alter table knowledge_base enable row level security;
alter table chat_logs enable row level security;

-- Política de lectura para usuarios autenticados (Profiles)
create policy "Users can view own profile"
on profiles for select
to authenticated
using (auth.uid() = id);

-- Política de lectura pública para Knowledge Base (necesaria para RAG si no se usa Service Key en Edge Function, pero idealmente restringida)
-- Para este caso, permitiremos lectura autenticada
create policy "Authenticated users can read knowledge base"
on knowledge_base for select
to authenticated
using (true);

-- Política para insertar logs de chat (Authenticated)
create policy "Users can insert chat logs"
on chat_logs for insert
to authenticated
with check (auth.uid() = user_id);
