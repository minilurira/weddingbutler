-- 모바일 청첩장 (무료 1차). Supabase SQL 편집기에서 한 번 실행한다. 다시 실행해도 안전하다.
-- 모든 읽기·쓰기는 홈페이지 서버(service role)만 한다. 브라우저에서 직접 접근하지 않도록 RLS를 켜고 정책은 두지 않는다.

create extension if not exists pgcrypto;

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- 공개 주소 코드: weddingbutler.co.kr/i/<slug>
  phone text not null,                       -- 만든 사람 휴대폰(숫자만). 다시 들어와 고칠 때 문자 인증에 쓴다
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
  password_hash text not null,               -- 하객이 자기 글을 지울 때 쓰는 4자리 비밀번호(해시)
  ip_hash text not null default '',          -- 도배 막기용(원래 IP는 저장하지 않는다)
  created_at timestamptz not null default now()
);
create index if not exists invitation_guestbook_inv_idx on invitation_guestbook (invitation_id, created_at desc);
alter table invitation_guestbook enable row level security;

-- 사진 저장소: 누구나 읽을 수 있는 공개 버킷(청첩장 사진). 올리기·지우기는 서버만 한다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-photos', 'invitation-photos', true, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;
