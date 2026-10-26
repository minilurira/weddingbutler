import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { defaultContent, sanitizeContent, type InvitationContent } from "@/lib/invitation/content";
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

const COLS = "id, slug, phone, template, status, content, published_at, created_at, updated_at";

function normalize(row: Record<string, unknown>): InvitationRow {
  const r = row as unknown as InvitationRow;
  return { ...r, content: sanitizeContent(r.id, r.content) };
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

export async function getBySlug(slug: string): Promise<InvitationRow | null> {
  if (!/^[A-Za-z0-9]{6,16}$/.test(slug)) return null;
  const { data, error } = await supabaseAdmin().from("invitations").select(COLS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function saveContent(id: string, phone: string, raw: unknown): Promise<InvitationRow | null> {
  const content = sanitizeContent(id, raw);
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
  if (status === "published") patch.published_at = new Date().toISOString();
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
