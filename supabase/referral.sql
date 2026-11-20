-- 영업대행 추천 코드(선택). 예약 때 확인된 코드. 없으면 null. 코드·수수료 원장은 어드민 DB에 있다.
alter table reservations add column if not exists referral_code text;
