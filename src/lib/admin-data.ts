import "server-only";

import { getSupabase } from "@/lib/supabase";
import { todayInSeoul } from "@/lib/availability";
import type { BookingRow } from "@/types/database";

/** 관리자 화면에 띄울 예약 목록. 다가오는 예식을 앞에 둔다. */
export async function listUpcomingBookings(limit = 30): Promise<BookingRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("event_date", todayInSeoul())
    .in("status", ["paid", "completed"])
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`예약 목록 조회 실패: ${error.message}`);
  return data ?? [];
}

/** 최근에 들어온 예약 (결제 전 포함) — 유입 확인용 */
export async function listRecentBookings(limit = 20): Promise<BookingRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`예약 목록 조회 실패: ${error.message}`);
  return data ?? [];
}

export type AdminStats = {
  upcoming: number;
  paidTotal: number;
  pendingAnswers: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabase();
  const today = todayInSeoul();

  const [upcoming, paid, unanswered] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today)
      .in("status", ["paid", "completed"]),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "completed"]),
    supabase
      .from("qna_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_answered", false),
  ]);

  return {
    upcoming: upcoming.count ?? 0,
    paidTotal: paid.count ?? 0,
    pendingAnswers: unanswered.count ?? 0,
  };
}

export type AdminQnaItem = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  isSecret: boolean;
  isAnswered: boolean;
};

/** 관리자에게는 비밀글도 그대로 보여준다 — 답변을 달아야 하기 때문이다. */
export async function listQnaForAdmin(limit = 30): Promise<AdminQnaItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("qna_posts")
    .select("id, title, content, author_name, created_at, is_secret, is_answered")
    .order("is_answered", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`문의 목록 조회 실패: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    createdAt: row.created_at,
    isSecret: row.is_secret,
    isAnswered: row.is_answered,
  }));
}
