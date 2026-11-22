-- 예약 화면의 예식장 지역(출장비)과 봉투 처리 방식. 이전 예약은 null / 0.
alter table reservations add column if not exists region text;
alter table reservations add column if not exists travel_fee integer not null default 0;
alter table reservations add column if not exists envelope_mode text check (envelope_mode in ('sealed', 'opened'));
