-- Habilitar la extensión pgvector para búsquedas semánticas
create extension if not exists vector;

-- Tabla de Perfiles con integración de Stripe y contador de consultas
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_tier text default 'free', -- 'free', 'premium'
  query_counter int default 0,
  last_query_reset timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS en profiles
alter table public.profiles enable row level security;

create policy "Usuarios pueden ver su propio perfil" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Tabla de Base de Conocimiento (RAG)
create table if not exists public.knowledge_base (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(768), -- Compatible con text-embedding-004 de Google
  created_at timestamp with time zone default now()
);

-- Índice para búsqueda de similitud de coseno
create index on public.knowledge_base using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Tabla de Historial de Chat
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text not null,
  role text check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Función para búsqueda de similitud (usada por retrieve_context)
create or replace function match_knowledge (
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
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
