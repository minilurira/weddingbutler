import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DatabaseNotConfiguredError } from "@/lib/supabase";
import { SlotTakenError } from "@/lib/bookings";
import { firstIssueMessage } from "@/lib/validation";

/** API 응답 형태를 한곳에서 통일한다. */
export function ok<T extends object>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function fail(message: string, status = 400, extra?: object) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/**
 * 라우트 핸들러에서 던져진 예외를 사용자에게 보여줄 메시지로 바꾼다.
 *
 * 예상치 못한 예외의 내부 메시지는 그대로 노출하지 않는다 — 스택이나
 * 접속 정보가 새어나갈 수 있다. 대신 서버 로그에만 남긴다.
 */
export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return fail(firstIssueMessage(error), 400);
  }

  if (error instanceof SlotTakenError) {
    return fail(error.message, 409);
  }

  if (error instanceof DatabaseNotConfiguredError) {
    console.error("[api] 데이터베이스 미설정:", error.message);
    return fail(
      "아직 예약 시스템 준비가 끝나지 않았습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.",
      503,
    );
  }

  console.error("[api] 처리 중 오류:", error);
  return fail(
    "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    500,
  );
}

/** JSON 본문을 안전하게 읽는다. 본문이 비었거나 깨졌으면 빈 객체를 준다. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
