import { cookies } from "next/headers";
import { fail, handleRouteError, ok, readJson } from "@/lib/api";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  checkAdminPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

/** POST /api/admin/session — 관리자 로그인 */
export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return fail(
        "관리자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았습니다.",
        503,
      );
    }

    const body = (await readJson(request)) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";

    if (!checkAdminPassword(password)) {
      // 어느 쪽이 틀렸는지 알려주지 않는다.
      return fail("비밀번호가 일치하지 않습니다.", 401);
    }

    const store = await cookies();
    store.set(ADMIN_COOKIE, createSessionToken(), ADMIN_COOKIE_OPTIONS);

    return ok({ authenticated: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** DELETE /api/admin/session — 로그아웃 */
export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return ok({ authenticated: false });
}
