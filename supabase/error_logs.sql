/* 오류 기록. 홈페이지와 어드민의 서버 오류, 브라우저 오류를 한곳에 모읍니다. 다시 실행해도 안전합니다. */

create table if not exists error_logs (
  id bigint generated always as identity primary key,
  source text not null default 'home',
  scope text not null default '',
  message text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists error_logs_created_idx on error_logs (created_at desc);

alter table error_logs enable row level security;
