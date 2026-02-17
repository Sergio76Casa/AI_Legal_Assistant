-- Create documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text, -- 'pdf', 'image', etc.
  url text not null, -- Supabase Storage URL
  status text default 'pending', -- 'pending', 'processing', 'indexed', 'failed'
  created_at timestamp with time zone default now()
);

-- Enable RLS for documents
alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Update knowledge_base table
alter table public.knowledge_base
add column if not exists user_id uuid references public.profiles(id) on delete cascade,
add column if not exists document_id uuid references public.documents(id) on delete cascade;

-- Enable RLS for knowledge_base
alter table public.knowledge_base enable row level security;

create policy "Users can view their own knowledge chunks"
  on public.knowledge_base for select
  using (auth.uid() = user_id);

create policy "Users can insert their own knowledge chunks"
  on public.knowledge_base for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own knowledge chunks"
  on public.knowledge_base for delete
  using (auth.uid() = user_id);

-- Recreate match_knowledge function with user_id filter
drop function if exists match_knowledge(vector, float, int);

create or replace function match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid
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
  and kb.user_id = filter_user_id
  order by similarity desc
  limit match_count;
end;
$$;
