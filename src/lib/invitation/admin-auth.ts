import { NextResponse } from "next/server";

/** 어드민 전용 API 인증: 어드민이 ADMIN_API_KEY(= 어드민의 RESERVATION_API_KEY)를 Bearer로 보낸다. 통과하면 null */
export function requireAdminKey(req: Request): NextResponse | null {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    console.error("[admin api] ADMIN_API_KEY is not set - refusing all requests.");
    return NextResponse.json({ code: "server_error", message: "server not configured" }, { status: 500 });
  }
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${apiKey}`) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  return null;
}
