-- Run once in the Supabase SQL editor. The website writes with the service key
-- (server side only); row level security keeps the table closed to everyone else.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'archived'))
);
alter table public.enquiries enable row level security;
