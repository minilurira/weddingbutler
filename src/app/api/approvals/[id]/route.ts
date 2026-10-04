import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkApiKey, expireIfNeeded, toResponse, type ApprovalRow } from "@/lib/approvals";

export const dynamic = "force-dynamic";

/** Polled by scripts/request-approval.mjs until the status leaves 'pending'. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("approval_requests")
    .select("id, title, status, resolved_by, resolved_at, expires_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("[approvals] fetch failed", error);
    return NextResponse.json({ ok: false, message: "승인 요청을 불러오지 못했습니다." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, message: "승인 요청을 찾을 수 없습니다." }, { status: 404 });
  }

  const row = await expireIfNeeded(db, data as ApprovalRow);
  return NextResponse.json(toResponse(row));
}
