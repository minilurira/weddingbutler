-- 스몰양가 요금제 추가 (2026-11-01)
-- reservations.plan 에 'smallboth' 를 허용한다. 이 SQL을 실행하기 전에는 스몰양가 예약이 저장되지 않는다.
alter table reservations drop constraint if exists reservations_plan_check;
alter table reservations add constraint reservations_plan_check
  check (plan in ('small', 'smallboth', 'standard', 'premium', 'special'));
