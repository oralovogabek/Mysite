-- OGABEK PORTFOLIO: run this entire script in Supabase SQL Editor.
-- Create an admin user first in Supabase Authentication -> Users.
-- Then replace the email below with the exact admin email and run the final INSERT.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('frontend','backend','bot','game')),
  description text not null,
  tech text[] not null default '{}',
  image text,
  github_url text,
  demo_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  status text not null default 'new' check (status in ('new','read')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.feedback enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

-- Public visitors can only read published projects.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects
for select to anon, authenticated using (published = true or public.is_portfolio_admin());

-- Only the admin can insert/update/delete projects.
drop policy if exists "Admin can insert projects" on public.projects;
create policy "Admin can insert projects" on public.projects
for insert to authenticated with check (public.is_portfolio_admin());
drop policy if exists "Admin can update projects" on public.projects;
create policy "Admin can update projects" on public.projects
for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects" on public.projects
for delete to authenticated using (public.is_portfolio_admin());

-- Public can submit feedback; only admin can read/manage it.
drop policy if exists "Anyone can send feedback" on public.feedback;
create policy "Anyone can send feedback" on public.feedback
for insert to anon, authenticated with check (
  length(trim(name)) between 1 and 80
  and length(trim(message)) between 1 and 2000
  and (email is null or length(email) <= 150)
);
drop policy if exists "Admin can read feedback" on public.feedback;
create policy "Admin can read feedback" on public.feedback
for select to authenticated using (public.is_portfolio_admin());
drop policy if exists "Admin can update feedback" on public.feedback;
create policy "Admin can update feedback" on public.feedback
for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
drop policy if exists "Admin can delete feedback" on public.feedback;
create policy "Admin can delete feedback" on public.feedback
for delete to authenticated using (public.is_portfolio_admin());

-- Public can read only the public profile setting. Admin can write settings.
drop policy if exists "Public can read profile settings" on public.site_settings;
create policy "Public can read profile settings" on public.site_settings
for select to anon, authenticated using (key = 'profile' or public.is_portfolio_admin());
drop policy if exists "Admin can write settings" on public.site_settings;
create policy "Admin can write settings" on public.site_settings
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

-- IMPORTANT: after creating your Auth user, run this with your own user UUID:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
-- Never expose a service_role key in frontend code.
