import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { lookupUserName, sendApprovalResult } from "@/lib/kakaowork";
import { expireIfNeeded, type ApprovalRow } from "@/lib/approvals";
import type { ApprovalButtonValue } from "@/lib/approval-types";

export const dynamic = "force-dynamic";

interface KakaoWorkCallback {
  type?: string;
  action_name?: string;
  value?: unknown;
  react_user_id?: string | number;
  message?: { conversation_id?: string | number };
}

function parseValue(raw: unknown): ApprovalButtonValue | null {
  let v: unknown = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw);
    } catch {
      return null; // not one of our buttons
    }
  }
  const candidate = v as Partial<ApprovalButtonValue> | null;
  if (typeof candidate?.actionToken === "string" && (candidate.decision === "approve" || candidate.decision === "reject")) {
    return candidate as ApprovalButtonValue;
  }
  return null;
}

/** Some consoles probe the callback URL with a GET when it is registered. */
export async function GET() {
  return NextResponse.json({ ok: true });
}

/**
 * KakaoWork posts here when someone presses a submit_action button. The
 * button's `action_token` is the credential: it is random, unique per
 * request, and never leaves the KakaoWork message. Always answer 200 so
 * KakaoWork doesn't show an error to whoever clicked; outcomes are logged.
 */
export async function POST(req: NextRequest) {
  let body: KakaoWorkCallback;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  // Don't filter on `type`: the button value's random action token is what
  // identifies (and authorizes) one of our clicks.
  const value = parseValue(body.value);
  if (!value) {
    console.warn("[approvals/callback] ignored callback without an approval payload", {
      type: body.type,
      action_name: body.action_name,
      keys: Object.keys(body ?? {}),
      valueType: typeof body.value,
    });
    return NextResponse.json({ ok: true, ignored: true });
  }

  const expectedConversation = process.env.KAKAOWORK_APPROVAL_CONVERSATION_ID;
  const conversation = body.message?.conversation_id;
  if (expectedConversation && conversation != null && String(conversation) !== expectedConversation) {
    console.warn("[approvals/callback] click from an unexpected conversation", conversation);
    return NextResponse.json({ ok: true, ignored: true });
  }

  const db = supabaseAdmin();
  const { data: found } = await db
    .from("approval_requests")
    .select("id, title, status, resolved_by, resolved_at, expires_at")
    .eq("action_token", value.actionToken)
    .maybeSingle();

  if (!found) {
    console.warn("[approvals/callback] unknown action token");
    return NextResponse.json({ ok: true, ignored: true });
  }

  const row = await expireIfNeeded(db, found as ApprovalRow);
  if (row.status !== "pending") {
    // Already decided or expired — a second click changes nothing.
    return NextResponse.json({ ok: true, status: row.status });
  }

  const status = value.decision === "approve" ? "approved" : "rejected";
  const resolvedBy = body.react_user_id != null ? await lookupUserName(body.react_user_id) : null;

  const { data: updated, error: updateError } = await db
    .from("approval_requests")
    .update({ status, resolved_by: resolvedBy, resolved_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (updateError) {
    console.error("[approvals/callback] failed to save decision", updateError);
  }

  if (updated) {
    await sendApprovalResult(row.title, status, resolvedBy);
  }
  return NextResponse.json({ ok: true, status });
}
