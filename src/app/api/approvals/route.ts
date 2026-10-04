import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendApprovalMessage } from "@/lib/kakaowork";
import { APPROVAL_TTL_MS, checkApiKey, toResponse, type ApprovalRow } from "@/lib/approvals";
import type { CreateApprovalInput } from "@/lib/approval-types";

export const dynamic = "force-dynamic";

/** Create a pending approval and send the 승인/거부 buttons to KakaoWork. */
export async function POST(req: NextRequest) {
  const auth = checkApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  let body: CreateApprovalInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "title is required." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const expiresAt = new Date(Date.now() + APPROVAL_TTL_MS);

  const { data: row, error } = await db
    .from("approval_requests")
    .insert({
      title: body.title.trim(),
      description: body.description?.trim() || null,
      commit_sha: body.commitSha?.trim() || null,
      commit_message: body.commitMessage?.trim() || null,
      branch: body.branch?.trim() || null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, action_token, title, status, resolved_by, resolved_at, expires_at")
    .single();

  if (error || !row) {
    console.error("[approvals] insert failed", error);
    return NextResponse.json({ ok: false, message: "승인 요청을 저장하지 못했습니다." }, { status: 500 });
  }

  try {
    const sent = await sendApprovalMessage({
      actionToken: row.action_token,
      title: row.title,
      description: body.description,
      commitSha: body.commitSha,
      commitMessage: body.commitMessage,
      branch: body.branch,
      expiresAt,
    });
    await db
      .from("approval_requests")
      .update({ kakaowork_conversation_id: sent.conversationId, kakaowork_message_id: sent.messageId })
      .eq("id", row.id);
  } catch (err) {
    console.error("[approvals] KakaoWork send failed", err);
    await db.from("approval_requests").update({ status: "error" }).eq("id", row.id);
    return NextResponse.json(
      { ok: false, id: row.id, status: "error", message: "카카오워크로 승인 요청을 보내지 못했습니다." },
      { status: 502 }
    );
  }

  // action_token deliberately left out: it only lives inside the KakaoWork buttons.
  const { action_token: _token, ...rest } = row;
  return NextResponse.json(toResponse(rest as ApprovalRow));
}
