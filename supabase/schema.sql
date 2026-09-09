-- ============================================================================
-- 웨딩버틀러 데이터베이스 스키마
--
-- 적용 방법:
--   1. supabase.com 에서 프로젝트를 만듭니다.
--   2. 좌측 메뉴 SQL Editor → New query 를 엽니다.
--   3. 이 파일 전체를 붙여넣고 Run 을 누릅니다.
--   4. Project Settings → API 에서 아래 두 값을 복사해 환경변수에 넣습니다.
--        Project URL        → NEXT_PUBLIC_SUPABASE_URL
--        service_role secret → SUPABASE_SERVICE_ROLE_KEY
--
-- 보안 메모:
--   모든 테이블에 RLS 를 켜되 정책은 만들지 않습니다.
--   따라서 anon 키로는 아무것도 읽거나 쓸 수 없고, 서버(Route Handler)에서
--   service_role 키로만 접근할 수 있습니다. service_role 키는 절대
--   클라이언트로 내보내지 마세요.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── 예약 ────────────────────────────────────────────────────────────────────

do $$ begin
  create type booking_status as enum ('pending', 'paid', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- 예약 내용
  plan_id         text        not null check (plan_id in ('small', 'standard', 'premium')),
  event_date      date        not null,
  event_time      text        not null,           -- "HH:MM"
  guest_count     integer     not null check (guest_count >= 0 and guest_count <= 1200),
  extra_butlers   integer     not null default 0 check (extra_butlers >= 0 and extra_butlers <= 6),

  -- 예식 정보
  groom_name      text        not null,
  bride_name      text        not null,
  venue_name      text        not null,
  venue_address   text,

  -- 연락처
  contact_name    text        not null,
  phone           text        not null,
  email           text,
  notes           text,

  -- 금액 (서버가 계산한 값만 저장한다)
  total_amount    integer     not null check (total_amount >= 0),
  deposit_amount  integer     not null check (deposit_amount >= 0),

  -- 결제
  status          booking_status not null default 'pending',
  payment_id      text        unique,             -- 포트원에 넘기는 결제 ID
  paid_at         timestamptz,
  cancelled_at    timestamptz,
  cancel_reason   text
);

-- 확정된 예약은 같은 날짜·시간에 하나만 존재할 수 있다.
-- pending 은 제외해서, 결제하다 이탈한 예약이 슬롯을 영구 점유하지 않게 한다.
create unique index if not exists bookings_confirmed_slot_unique
  on public.bookings (event_date, event_time)
  where status in ('paid', 'completed');

create index if not exists bookings_event_date_idx on public.bookings (event_date);
create index if not exists bookings_status_idx     on public.bookings (status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- ── 결제 기록 ───────────────────────────────────────────────────────────────

create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  booking_id         uuid references public.bookings (id) on delete cascade,
  portone_payment_id text not null,
  amount             integer not null,
  status             text    not null,   -- PAID / FAILED / CANCELLED / VIRTUAL_ACCOUNT_ISSUED ...
  method             text,
  raw                jsonb,              -- 포트원 응답 원본 (분쟁 대응용)
  unique (portone_payment_id, status)
);

create index if not exists payments_booking_id_idx on public.payments (booking_id);

-- ── QnA 게시판 ──────────────────────────────────────────────────────────────

create table if not exists public.qna_posts (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text    not null,
  content       text    not null,
  author_name   text    not null,
  password_hash text    not null,        -- scrypt 해시. 평문은 저장하지 않는다.
  is_secret     boolean not null default false,
  is_answered   boolean not null default false,
  view_count    integer not null default 0
);

create index if not exists qna_posts_created_at_idx on public.qna_posts (created_at desc);

create table if not exists public.qna_answers (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  post_id    bigint not null references public.qna_posts (id) on delete cascade,
  content    text   not null
);

create index if not exists qna_answers_post_id_idx on public.qna_answers (post_id);

-- ── updated_at 자동 갱신 ────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

drop trigger if exists qna_posts_touch_updated_at on public.qna_posts;
create trigger qna_posts_touch_updated_at
  before update on public.qna_posts
  for each row execute function public.touch_updated_at();

drop trigger if exists qna_answers_touch_updated_at on public.qna_answers;
create trigger qna_answers_touch_updated_at
  before update on public.qna_answers
  for each row execute function public.touch_updated_at();

-- ── 조회수 증가 (원자적) ────────────────────────────────────────────────────

create or replace function public.increment_qna_view(target_id bigint)
returns void
language sql
as $$
  update public.qna_posts set view_count = view_count + 1 where id = target_id;
$$;

-- ── RLS: 켜두고 정책은 만들지 않는다 (service_role 만 통과) ─────────────────

alter table public.bookings    enable row level security;
alter table public.payments    enable row level security;
alter table public.qna_posts   enable row level security;
alter table public.qna_answers enable row level security;
