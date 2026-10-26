/* 어드민 결제내역·취소용. invitation.sql과 invitation_premium.sql을 먼저 실행한 뒤 한 번 실행합니다. 다시 실행해도 안전합니다. */

alter table invitation_orders alter column invitation_id drop not null;
alter table invitation_orders drop constraint if exists invitation_orders_invitation_id_fkey;
alter table invitation_orders add constraint invitation_orders_invitation_id_fkey foreign key (invitation_id) references invitations(id) on delete set null;

alter table invitation_orders add column if not exists phone text not null default '';
alter table invitation_orders add column if not exists groom text not null default '';
alter table invitation_orders add column if not exists bride text not null default '';
alter table invitation_orders add column if not exists slug text not null default '';
alter table invitation_orders add column if not exists cancelled_at timestamptz;
alter table invitation_orders add column if not exists cancelled_amount int;
alter table invitation_orders add column if not exists cancel_reason text not null default '';

alter table invitation_orders drop constraint if exists invitation_orders_status_check;
alter table invitation_orders add constraint invitation_orders_status_check check (status in ('pending', 'paid', 'failed', 'cancelled'));

update invitation_orders o set phone = i.phone, groom = coalesce(i.content->>'groom', ''), bride = coalesce(i.content->>'bride', ''), slug = i.slug from invitations i where o.invitation_id = i.id and o.phone = '';
