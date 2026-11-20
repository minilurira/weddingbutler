import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminPublicPost, LOOKUP_COOKIE, lookupPhone } from "@/lib/lookup-api";

export const dynamic = "force-dynamic";

// 예약 조회 화면의 '내 추천 코드'. 문자 인증을 마친 번호(세션 쿠키)로만 어드민을 부른다.
export async function GET() {
  const phone = lookupPhone(cookies().get(LOOKUP_COOKIE)?.value);
  if (!phone) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { status, body } = await adminPublicPost("referral/mine", { phone, action: "get" });
  return NextResponse.json(body, { status });
}

const ACTIONS = new Set(["issue", "account", "resident"]);

export async function POST(req: Request) {
  const phone = lookupPhone(cookies().get(LOOKUP_COOKIE)?.value);
  if (!phone) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "";
  if (!ACTIONS.has(action)) return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  const payload: Record<string, unknown> = { phone, action };
  if (action === "issue") payload.agreed = body.agreed === true;
  if (action === "account") Object.assign(payload, { bankName: String(body.bankName ?? ""), accountNumber: String(body.accountNumber ?? ""), accountHolder: String(body.accountHolder ?? "") });
  if (action === "resident") payload.residentNo = String(body.residentNo ?? "");
  const { status, body: data } = await adminPublicPost("referral/mine", payload);
  return NextResponse.json(data, { status });
}
