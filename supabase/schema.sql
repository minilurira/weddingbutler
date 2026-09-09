-- Wedding Butler: Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) for your project.

create extension if not exists pgcrypto;

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  booking_no text not null unique,
  plan text not null check (plan in ('small', 'standard', 'premium')),
  ceremony_year int not null,
  ceremony_month int not null,
  ceremony_day int not null,
  ceremony_time text not null,
  couple_name text not null,
  phone text not null,
  venue text,
  guests int not null,
  extra_butlers int not null default 0,
  pay_method text not null,
  base_amount int not null,
  over_amount int not null,
  extra_butler_amount int not null,
  total_amount int not null,
  deposit_amount int not null,
  balance_amount int not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cancelled')),
  portone_payment_id text not null unique,
  portone_tx_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists reservations_payment_status_idx on reservations (payment_status);
create index if not exists reservations_created_at_idx on reservations (created_at desc);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  ceremony_date text,
  area text,
  topic text not null,
  message text not null,
  agreed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);

-- RLS is enabled with NO policies attached on purpose: the anon/public key can
-- neither read nor write these tables. All access goes through the Next.js
-- API routes using the service role key (see src/lib/supabase.ts), so PII
-- (names, phone numbers, venues) is never reachable directly from the browser.
alter table reservations enable row level security;
alter table contact_messages enable row level security;
