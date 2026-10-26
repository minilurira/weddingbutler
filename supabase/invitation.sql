/* 모바일 청첩장 (무료 1차). Supabase SQL Editor에 붙여넣고 Run 한 번. 다시 실행해도 안전합니다. */

create extension if not exists pgcrypto;

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  phone text not null,
  template text not null default 'classic',
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  content jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invitations_phone_idx on invitations (phone);
alter table invitations enable row level security;

create table if not exists invitation_guestbook (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null,
  message text not null,
  password_hash text not null,
  ip_hash text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists invitation_guestbook_inv_idx on invitation_guestbook (invitation_id, created_at desc);
alter table invitation_guestbook enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-photos', 'invitation-photos', true, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;
