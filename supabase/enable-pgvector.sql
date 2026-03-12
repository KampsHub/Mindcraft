-- Enable pgvector and set up embedding search for RAG
-- Run this in Supabase SQL Editor

-- 1. Enable the pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Add embedding column to entries table
-- voyage-3-lite produces 512-dimensional vectors
alter table public.entries
  add column if not exists embedding vector(512);

-- 3. Create an HNSW index for fast similarity search
-- HNSW is better for small-to-medium datasets (no training data needed)
create index if not exists idx_entries_embedding
  on public.entries
  using hnsw (embedding vector_cosine_ops);

-- 4. Create the similarity search function
create or replace function match_entries(
  query_embedding vector(512),
  match_client_id uuid,
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  theme_tags text[],
  date date,
  type text,
  similarity float
)
language sql stable
as $$
  select
    e.id,
    e.content,
    e.theme_tags,
    e.date,
    e.type::text,
    1 - (e.embedding <=> query_embedding) as similarity
  from entries e
  where e.client_id = match_client_id
    and e.embedding is not null
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
