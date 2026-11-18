-- 고객이 예약 때 고른 "알게 된 경로"(선택). 없으면 null.
alter table reservations add column if not exists source text;
