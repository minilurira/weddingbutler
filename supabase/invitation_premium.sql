/* 모바일 청첩장 프리미엄. invitation.sql을 먼저 실행한 뒤 Supabase SQL Editor에서 한 번 실행합니다. 다시 실행해도 안전합니다. */

alter table invitations add column if not exists paid_at timestamptz;
alter table invitations add column if not exists pay_id text;
alter table invitations add column if not exists pay_amount int;

create table if not exists invitation_orders (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  payment_id text not null unique,
  amount int not null,
  template text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists invitation_orders_inv_idx on invitation_orders (invitation_id, created_at desc);
alter table invitation_orders enable row level security;

create table if not exists invitation_events (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references invitations(id) on delete cascade,
  kind text not null,
  source text not null default 'etc',
  created_at timestamptz not null default now()
);
create index if not exists invitation_events_inv_idx on invitation_events (invitation_id, created_at desc);
alter table invitation_events enable row level security;
