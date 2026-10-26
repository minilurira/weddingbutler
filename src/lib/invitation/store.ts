import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { PREMIUM_PRICE, defaultContent, galleryMax, isExpired, isPremium, sanitizeContent, type InvitationContent } from "@/lib/invitation/content";
import { newSlug } from "@/lib/invitation/guard";

// 모바일 청첩장 DB 접근 (Supabase, 서버 전용). 테이블은 supabase/invitation.sql.

export const PHOTO_BUCKET = "invitation-photos";
export const MAX_INVITATIONS_PER_PHONE = 5;

export interface InvitationRow {
  id: string;
  slug: string;
  phone: string;
  template: string;
  status: "draft" | "published" | "hidden";
  content: InvitationContent;
  paid_at: string | null;
  pay_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestbookRow {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const COLS = "id, slug, phone, template, status, content, paid_at, pay_id, published_at, created_at, updated_at";

function normalize(row: Record<string, unknown>): InvitationRow {
  const r = row as unknown as InvitationRow;
  return { ...r, content: sanitizeContent(r.id, r.content, r.template) };
}

/** 사진 주소의 앞부분 (뒤에 저장소 경로를 붙인다). 서버 컴포넌트가 문자열로 넘길 수 있게 함수가 아닌 값으로 둔다 */
export function photoBase(): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/`;
}

export function photoUrl(path: string): string {
  return path ? `${photoBase()}${path}` : "";
}

export async function listByPhone(phone: string): Promise<InvitationRow[]> {
  const { data, error } = await supabaseAdmin().from("invitations").select(COLS).eq("phone", phone).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function createInvitation(phone: string): Promise<InvitationRow | "limit"> {
  const db = supabaseAdmin();
  const { count, error: countErr } = await db.from("invitations").select("id", { count: "exact", head: true }).eq("phone", phone);
  if (countErr) throw countErr;
  if ((count ?? 0) >= MAX_INVITATIONS_PER_PHONE) return "limit";
  // 주소 코드가 겹치면(아주 드묾) 다시 만든다
  for (let i = 0; i < 4; i++) {
    const { data, error } = await db
      .from("invitations")
      .insert({ slug: newSlug(), phone, template: "classic", status: "draft", content: defaultContent() })
      .select(COLS)
      .single();
    if (!error && data) return normalize(data);
    if (error && error.code !== "23505") throw error;
  }
  throw new Error("slug collision");
}

/** 그 번호로 만든 청첩장이면 돌려준다 (아니면 null) */
export async function getOwned(id: string, phone: string): Promise<InvitationRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabaseAdmin().from("invitations").select(COLS).eq("id", id).eq("phone", phone).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

/** 하객에게 열려 있는 청첩장: 공개 중이고 보관 기간(6개월)이 지나지 않았다 */
export function isLive(row: InvitationRow): boolean {
  return row.status === "published" && !isExpired(row.content.date, row.published_at);
}

export async function getBySlug(slug: string): Promise<InvitationRow | null> {
  if (!/^[A-Za-z0-9]{6,16}$/.test(slug)) return null;
  const { data, error } = await supabaseAdmin().from("invitations").select(COLS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function saveContent(id: string, phone: string, raw: unknown): Promise<InvitationRow | null> {
  const cur = await getOwned(id, phone);
  if (!cur) return null;
  const content = sanitizeContent(id, raw, cur.template);
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("phone", phone)
    .select(COLS)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function setStatus(id: string, phone: string, status: "published" | "hidden" | "draft"): Promise<InvitationRow | null> {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "published") {
    // 보관 기간(6개월)은 처음 발행한 날부터 센다. 다시 발행해도 처음 날짜를 지킨다.
    const { data: cur } = await supabaseAdmin().from("invitations").select("published_at").eq("id", id).eq("phone", phone).maybeSingle();
    patch.published_at = cur?.published_at ?? new Date().toISOString();
  }
  const { data, error } = await supabaseAdmin().from("invitations").update(patch).eq("id", id).eq("phone", phone).select(COLS).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function deleteInvitation(id: string, phone: string): Promise<boolean> {
  const db = supabaseAdmin();
  const row = await getOwned(id, phone);
  if (!row) return false;
  const { data: files } = await db.storage.from(PHOTO_BUCKET).list(id, { limit: 100 });
  if (files?.length) await db.storage.from(PHOTO_BUCKET).remove(files.map((f) => `${id}/${f.name}`));
  const { error } = await db.from("invitations").delete().eq("id", id).eq("phone", phone);
  if (error) throw error;
  return true;
}

/** 사진 한 장을 저장소에 올리고 경로를 돌려준다 */
export async function uploadPhoto(id: string, bytes: ArrayBuffer, type: "image/jpeg" | "image/webp"): Promise<string> {
  const path = `${id}/${crypto.randomBytes(9).toString("base64url")}.${type === "image/webp" ? "webp" : "jpg"}`;
  const { error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return path;
}

export async function countPhotos(id: string): Promise<number> {
  const { data, error } = await supabaseAdmin().storage.from(PHOTO_BUCKET).list(id, { limit: 200 });
  if (error) throw error;
  return data?.length ?? 0;
}

/** 내용에서 더 이상 쓰지 않는 사진 파일을 지운다 (저장할 때마다 정리) */
export async function pruneUnusedPhotos(id: string, content: InvitationContent): Promise<void> {
  const db = supabaseAdmin();
  const used = new Set([content.cover, ...content.gallery].filter(Boolean));
  const { data } = await db.storage.from(PHOTO_BUCKET).list(id, { limit: 200, sortBy: { column: "created_at", order: "asc" } });
  // 방금 올리고 아직 저장 전인 사진은 지우지 않도록 10분 지난 파일만 정리한다
  const cutoff = Date.now() - 10 * 60 * 1000;
  const stale = (data ?? []).filter((f) => !used.has(`${id}/${f.name}`) && f.created_at && new Date(f.created_at).getTime() < cutoff);
  if (stale.length) await db.storage.from(PHOTO_BUCKET).remove(stale.map((f) => `${id}/${f.name}`));
}

// --- 방명록 ---

export async function listGuestbook(invitationId: string, limit = 100): Promise<GuestbookRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("invitation_guestbook")
    .select("id, name, message, created_at")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function recentGuestbookCount(invitationId: string, ipHash: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin()
    .from("invitation_guestbook")
    .select("id", { count: "exact", head: true })
    .eq("invitation_id", invitationId)
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

export async function addGuestbook(invitationId: string, entry: { name: string; message: string; passwordHash: string; ipHash: string }): Promise<GuestbookRow> {
  const { data, error } = await supabaseAdmin()
    .from("invitation_guestbook")
    .insert({ invitation_id: invitationId, name: entry.name, message: entry.message, password_hash: entry.passwordHash, ip_hash: entry.ipHash })
    .select("id, name, message, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function getGuestbookHash(invitationId: string, entryId: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(entryId)) return null;
  const { data, error } = await supabaseAdmin().from("invitation_guestbook").select("password_hash").eq("id", entryId).eq("invitation_id", invitationId).maybeSingle();
  if (error) throw error;
  return data?.password_hash ?? null;
}

export async function deleteGuestbook(invitationId: string, entryId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("invitation_guestbook").delete().eq("id", entryId).eq("invitation_id", invitationId);
  if (error) throw error;
}

// --- 템플릿 · 결제 (프리미엄) ---

/** 템플릿을 바꾼다. 무료 템플릿으로 바꾸면 갤러리를 12장까지만 남긴다. */
export async function setTemplate(id: string, phone: string, template: string): Promise<InvitationRow | null> {
  const cur = await getOwned(id, phone);
  if (!cur) return null;
  const content = { ...cur.content, gallery: cur.content.gallery.slice(0, galleryMax(template)) };
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .update({ template, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("phone", phone)
    .select(COLS)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export const isPaid = (row: Pick<InvitationRow, "paid_at">) => Boolean(row.paid_at);

/** 결제 주문을 만든다. 금액은 서버가 정한다(브라우저가 보낸 값은 쓰지 않는다). */
export async function createOrder(row: InvitationRow): Promise<{ paymentId: string; amount: number }> {
  const paymentId = `inv-${row.id.replace(/-/g, "").slice(0, 12)}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
  const { error } = await supabaseAdmin().from("invitation_orders").insert({ invitation_id: row.id, payment_id: paymentId, amount: PREMIUM_PRICE, template: row.template, phone: row.phone, groom: row.content.groom, bride: row.content.bride, slug: row.slug });
  if (error) throw error;
  return { paymentId, amount: PREMIUM_PRICE };
}

export async function getOrder(invitationId: string, paymentId: string): Promise<{ id: string; amount: number; status: string } | null> {
  const { data, error } = await supabaseAdmin().from("invitation_orders").select("id, amount, status").eq("invitation_id", invitationId).eq("payment_id", paymentId).maybeSingle();
  if (error) throw error;
  return data;
}

/** 결제가 확인된 주문을 처리한다: 주문을 paid로 바꾸고 청첩장에 결제 완료를 기록한다 (다시 불러도 같은 결과). */
export async function markPaid(invitationId: string, paymentId: string, amount: number): Promise<void> {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { error: e1 } = await db.from("invitation_orders").update({ status: "paid", paid_at: now }).eq("invitation_id", invitationId).eq("payment_id", paymentId);
  if (e1) throw e1;
  const { error: e2 } = await db.from("invitations").update({ paid_at: now, pay_id: paymentId, pay_amount: amount }).eq("id", invitationId).is("paid_at", null);
  if (e2) throw e2;
}

// --- 이용 통계 (프리미엄 대시보드) ---

export const EVENT_KINDS = ["view", "map", "copy_account", "copy_address", "call", "sms", "copy_url"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export async function addEvent(invitationId: string, kind: EventKind, source: string): Promise<void> {
  const { error } = await supabaseAdmin().from("invitation_events").insert({ invitation_id: invitationId, kind, source });
  if (error) throw error;
}

export interface InvitationStats {
  total: number;
  today: number;
  week: { date: string; count: number }[];
  sources: { source: string; count: number }[];
  actions: Record<string, number>;
  guestbook: number;
}

const kst = (ms: number) => new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);

export async function getStats(invitationId: string, now = Date.now()): Promise<InvitationStats> {
  const db = supabaseAdmin();
  const since = new Date(now - 30 * 86400000).toISOString();
  // ponytail: 최근 30일 이벤트를 한 번에 가져와 서버에서 센다(2만 건 상한). 방문이 아주 많아지면 SQL 집계로 바꾼다.
  const { data, error } = await db.from("invitation_events").select("kind, source, created_at").eq("invitation_id", invitationId).gte("created_at", since).order("created_at", { ascending: false }).limit(20000);
  if (error) throw error;
  const rows = data ?? [];
  const today = kst(now);
  const days = Array.from({ length: 7 }, (_, i) => kst(now - (6 - i) * 86400000));
  const byDay = new Map(days.map((d) => [d, 0]));
  const sources = new Map<string, number>();
  const actions: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    if (r.kind === "view") {
      total++;
      const d = kst(new Date(r.created_at).getTime());
      if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1);
      sources.set(r.source, (sources.get(r.source) ?? 0) + 1);
    } else {
      actions[r.kind] = (actions[r.kind] ?? 0) + 1;
    }
  }
  const { count } = await db.from("invitation_guestbook").select("id", { count: "exact", head: true }).eq("invitation_id", invitationId);
  return {
    total,
    today: byDay.get(today) ?? 0,
    week: days.map((date) => ({ date, count: byDay.get(date) ?? 0 })),
    sources: Array.from(sources, ([source, c]) => ({ source, count: c })).sort((a, b) => b.count - a.count),
    actions,
    guestbook: count ?? 0,
  };
}

// --- 어드민: 결제내역과 취소 ---

export interface AdminOrder {
  paymentId: string;
  invitationId: string | null;
  amount: number;
  status: string;
  template: string;
  phone: string;
  groom: string;
  bride: string;
  slug: string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  cancelledAmount: number | null;
  cancelReason: string;
  /** 청첩장의 지금 상태 (지워졌으면 null) */
  invitationStatus: string | null;
  invitationTemplate: string | null;
}

const ORDER_COLS = "payment_id, invitation_id, amount, status, template, phone, groom, bride, slug, created_at, paid_at, cancelled_at, cancelled_amount, cancel_reason";

export async function listOrders(fromIso: string, untilIso: string): Promise<AdminOrder[]> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("invitation_orders").select(ORDER_COLS).gte("created_at", fromIso).lt("created_at", untilIso).order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  const rows = data ?? [];
  const ids = Array.from(new Set(rows.map((r) => r.invitation_id).filter(Boolean))) as string[];
  const inv = new Map<string, { status: string; template: string }>();
  if (ids.length) {
    const { data: invs, error: e2 } = await db.from("invitations").select("id, status, template").in("id", ids);
    if (e2) throw e2;
    for (const i of invs ?? []) inv.set(i.id, { status: i.status, template: i.template });
  }
  return rows.map((r) => ({
    paymentId: r.payment_id,
    invitationId: r.invitation_id,
    amount: r.amount,
    status: r.status,
    template: r.template,
    phone: r.phone,
    groom: r.groom,
    bride: r.bride,
    slug: r.slug,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    cancelledAt: r.cancelled_at,
    cancelledAmount: r.cancelled_amount,
    cancelReason: r.cancel_reason,
    invitationStatus: r.invitation_id ? inv.get(r.invitation_id)?.status ?? null : null,
    invitationTemplate: r.invitation_id ? inv.get(r.invitation_id)?.template ?? null : null,
  }));
}

export async function getOrderByPayment(paymentId: string): Promise<{ id: string; invitationId: string | null; amount: number; status: string } | null> {
  const { data, error } = await supabaseAdmin().from("invitation_orders").select("id, invitation_id, amount, status").eq("payment_id", paymentId).maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, invitationId: data.invitation_id, amount: data.amount, status: data.status } : null;
}

/**
 * 결제 취소가 PG에서 끝난 뒤의 정리: 주문을 취소로 바꾸고, 청첩장의 결제 완료 표시를 지운다.
 * after = "free": 무료 템플릿으로 바꾸고 공개 상태는 그대로 · "hide": 비공개로 바꾼다.
 */
export async function applyCancellation(order: { id: string; invitationId: string | null }, amount: number, reason: string, after: "free" | "hide"): Promise<void> {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { error: e1 } = await db.from("invitation_orders").update({ status: "cancelled", cancelled_at: now, cancelled_amount: amount, cancel_reason: reason }).eq("id", order.id);
  if (e1) throw e1;
  if (!order.invitationId) return;
  const patch: Record<string, unknown> = { paid_at: null, pay_id: null, pay_amount: null, updated_at: now };
  if (after === "hide") patch.status = "hidden";
  else {
    const { data } = await db.from("invitations").select("id, phone, content").eq("id", order.invitationId).maybeSingle();
    if (data) {
      const content = sanitizeContent(data.id, data.content, "classic");
      patch.template = "classic";
      patch.content = content; // 무료 템플릿 갤러리 한도(12장)로 정리
    }
  }
  const { error: e2 } = await db.from("invitations").update(patch).eq("id", order.invitationId);
  if (e2) throw e2;
}
