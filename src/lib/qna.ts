import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getSupabase } from "@/lib/supabase";
import type { QnaAnswerRow, QnaPostRow } from "@/types/database";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * 글 비밀번호를 해시로 바꾼다.
 *
 * 비밀번호를 그대로 저장하면, DB 가 유출됐을 때 다른 사이트에서 같은
 * 비밀번호를 쓰는 사람들까지 위험해진다. 솔트를 섞은 scrypt 해시만 남긴다.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${derived.toString("hex")}`;
}

/** 입력한 비밀번호가 저장된 해시와 맞는지 확인한다. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");

  // 길이가 다르면 timingSafeEqual 이 던지므로 먼저 걸러낸다.
  if (expected.length !== derived.length) return false;

  // 비교 시간이 값에 따라 달라지지 않도록 상수 시간 비교를 쓴다.
  return timingSafeEqual(expected, derived);
}

export const QNA_PAGE_SIZE = 10;

export type QnaListItem = {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
  isSecret: boolean;
  isAnswered: boolean;
  viewCount: number;
};

export type QnaListResult = {
  items: QnaListItem[];
  total: number;
  page: number;
  pageCount: number;
};

/** 목록에서는 본문과 비밀번호 해시를 아예 가져오지 않는다. */
export async function listPosts(page = 1): Promise<QnaListResult> {
  const supabase = getSupabase();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * QNA_PAGE_SIZE;

  const { data, error, count } = await supabase
    .from("qna_posts")
    .select("id, title, author_name, created_at, is_secret, is_answered, view_count", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + QNA_PAGE_SIZE - 1);

  if (error) throw new Error(`문의 목록을 불러오지 못했습니다: ${error.message}`);

  const total = count ?? 0;

  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      authorName: maskName(row.author_name),
      createdAt: row.created_at,
      isSecret: row.is_secret,
      isAnswered: row.is_answered,
      viewCount: row.view_count,
    })),
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / QNA_PAGE_SIZE)),
  };
}

export type QnaPostDetail = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  isSecret: boolean;
  isAnswered: boolean;
  viewCount: number;
  answers: { id: number; content: string; createdAt: string }[];
};

export async function getPostRaw(id: number): Promise<QnaPostRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("qna_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`문의를 불러오지 못했습니다: ${error.message}`);
  return data;
}

export async function getAnswers(postId: number): Promise<QnaAnswerRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("qna_answers")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`답변을 불러오지 못했습니다: ${error.message}`);
  return data ?? [];
}

/** 글 상세를 화면에 내려보낼 형태로 만든다. 비밀번호 해시는 절대 포함하지 않는다. */
export async function toDetail(post: QnaPostRow): Promise<QnaPostDetail> {
  const answers = await getAnswers(post.id);
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorName: maskName(post.author_name),
    createdAt: post.created_at,
    isSecret: post.is_secret,
    isAnswered: post.is_answered,
    viewCount: post.view_count,
    answers: answers.map((answer) => ({
      id: answer.id,
      content: answer.content,
      createdAt: answer.created_at,
    })),
  };
}

export async function createPost(input: {
  title: string;
  content: string;
  authorName: string;
  password: string;
  isSecret: boolean;
}): Promise<number> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("qna_posts")
    .insert({
      title: input.title,
      content: input.content,
      author_name: input.authorName,
      password_hash: await hashPassword(input.password),
      is_secret: input.isSecret,
    })
    .select("id")
    .single();

  if (error) throw new Error(`문의를 등록하지 못했습니다: ${error.message}`);
  return data.id;
}

export async function incrementViewCount(id: number): Promise<void> {
  const supabase = getSupabase();
  // 조회수는 실패해도 글 읽기를 막을 이유가 없다.
  const { error } = await supabase.rpc("increment_qna_view", { target_id: id });
  if (error) console.error("[qna] 조회수 증가 실패:", error.message);
}

export async function deletePost(id: number): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("qna_posts").delete().eq("id", id);
  if (error) throw new Error(`문의를 삭제하지 못했습니다: ${error.message}`);
}

export async function addAnswer(
  postId: number,
  content: string,
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("qna_answers")
    .insert({ post_id: postId, content });

  if (error) throw new Error(`답변을 등록하지 못했습니다: ${error.message}`);

  const { error: flagError } = await supabase
    .from("qna_posts")
    .update({ is_answered: true })
    .eq("id", postId);

  if (flagError) {
    console.error("[qna] 답변완료 표시 실패:", flagError.message);
  }
}

/** "홍길동" → "홍*동", "김철" → "김*" — 목록에 실명이 그대로 노출되지 않게 한다. */
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed.at(-1)}`;
}
