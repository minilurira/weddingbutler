-- 스페셜 예약 링크용 DB 변경 (2026-10-24).
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요. 여러 번 실행해도 안전합니다.
-- 이 변경이 적용되기 전에는 스페셜 링크로 예약을 만들 수 없고(안내 문구가 나옵니다), 일반 예약은 영향이 없습니다.

-- 1) plan 값에 'special' 허용
alter table reservations drop constraint if exists reservations_plan_check;
alter table reservations add constraint reservations_plan_check check (plan in ('small', 'standard', 'premium', 'special'));

-- 2) 스페셜 링크 토큰 (일반 예약은 null)
alter table reservations add column if not exists special_token text;
