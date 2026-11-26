-- Alur Baksho cloud database (Supabase PostgreSQL)
-- This is intentionally separate from database/alur_baksho.sql (local MariaDB).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 3 and 60),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists comments_post_created_idx on public.comments (post_id, created_at);
create index if not exists comments_user_id_idx on public.comments (user_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function private.set_updated_at();

-- Create the public profile when Supabase Auth creates a new user.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''), split_part(coalesce(new.email, 'member'), '@', 1));
  requested_username := left(requested_username, 60);
  if char_length(requested_username) < 3 then
    requested_username := 'Member';
  end if;
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    left(requested_username, 60),
    nullif(new.raw_user_meta_data ->> 'user_image_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Profiles and feed content are readable to everyone; writes require an authenticated owner.
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles
for select to anon, authenticated using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Posts are publicly readable" on public.posts;
create policy "Posts are publicly readable" on public.posts
for select to anon, authenticated using (true);

drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts" on public.posts
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts" on public.posts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts" on public.posts
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable" on public.comments
for select to anon, authenticated using (true);

drop policy if exists "Users can add their own comments" on public.comments;
create policy "Users can add their own comments" on public.comments
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.posts p where p.id = post_id)
);

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments" on public.comments
for delete to authenticated using ((select auth.uid()) = user_id);

-- Least-privilege Data API grants. RLS remains the row-level authority.
grant select on public.profiles, public.posts, public.comments to anon, authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, delete on public.comments to authenticated;
