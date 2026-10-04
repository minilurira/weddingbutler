import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendApprovalResult } from "@/lib/kakaowork";
import type { ApprovalResponse, ApprovalStatus } from "@/lib/approval-types";

/** How long the KakaoWork group has to answer before the request auto-rejects. */
export const APPROVAL_TTL_MS = 30 * 60 * 1000;

export interface ApprovalRow {
  id: string;
  title: string;
  status: ApprovalStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  expires_at: string;
}

/**
 * The approval API is called by the deploy script, not the browser. Refuse
 * everything when APPROVAL_API_KEY is unset rather than run unauthenticated.
 */
export function checkApiKey(req: NextRequest): { ok: true } | { ok: false; status: number; message: string } {
  const expected = process.env.APPROVAL_API_KEY;
  if (!expected) {
    return { ok: false, status: 500, message: "APPROVAL_API_KEY is not configured." };
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return { ok: false, status: 401, message: "Unauthorized." };
  }
  return { ok: true };
}

/**
 * There is no scheduler in this project, so expiry is applied lazily: whoever
 * reads a pending row past `expires_at` (the poller or a late button click)
 * flips it to 'timeout'. The `status = 'pending'` guard makes this race-safe
 * against a click landing at the same moment.
 */
export async function expireIfNeeded(db: SupabaseClient, row: ApprovalRow): Promise<ApprovalRow> {
  if (row.status !== "pending" || new Date(row.expires_at).getTime() > Date.now()) return row;

  const { data } = await db
    .from("approval_requests")
    .update({ status: "timeout", resolved_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id, title, status, resolved_by, resolved_at, expires_at")
    .maybeSingle();

  if (data) {
    await sendApprovalResult(row.title, "timeout");
    return data as ApprovalRow;
  }
  // Someone else resolved it first — re-read the final state.
  const { data: fresh } = await db
    .from("approval_requests")
    .select("id, title, status, resolved_by, resolved_at, expires_at")
    .eq("id", row.id)
    .single();
  return (fresh as ApprovalRow) ?? row;
}

export function toResponse(row: ApprovalRow): ApprovalResponse {
  return {
    ok: true,
    id: row.id,
    status: row.status,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    expiresAt: row.expires_at,
  };
}
