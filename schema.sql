-- Supabase schema for the bookmarks table (Supabase SQL Editor, already applied to the live project).
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  memo text,
  category text not null default 'etc',
  created_at timestamptz not null default now()
);

alter table public.bookmarks enable row level security;

-- Learning-scope app, no auth required by requirements.md -> anon key gets full CRUD.
drop policy if exists "anon full access" on public.bookmarks;
create policy "anon full access" on public.bookmarks
  for all
  to anon
  using (true)
  with check (true);
