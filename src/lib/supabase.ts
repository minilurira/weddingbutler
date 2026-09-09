import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * 서버 전용 Supabase 클라이언트.
 *
 * service_role 키는 RLS 를 우회하므로 절대 클라이언트 번들에 들어가면 안 된다.
 * 파일 최상단의 "server-only" import 가 그 실수를 빌드 타임에 잡아준다.
 */

let cached: SupabaseClient<Database> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabase(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new DatabaseNotConfiguredError();
  }

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

/** 환경변수가 아직 안 들어왔을 때 던지는 에러. API 라우트가 안내 메시지로 바꿔준다. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "데이터베이스가 아직 연결되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정해 주세요.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}
