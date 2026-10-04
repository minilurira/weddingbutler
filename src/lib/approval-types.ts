export type ApprovalStatus = "pending" | "approved" | "rejected" | "timeout" | "error";

export type ApprovalDecision = "approve" | "reject";

export interface CreateApprovalInput {
  title: string;
  description?: string;
  commitSha?: string;
  commitMessage?: string;
  branch?: string;
}

export interface ApprovalResponse {
  ok: boolean;
  id?: string;
  status?: ApprovalStatus;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  expiresAt?: string;
  message?: string;
}

/** What each KakaoWork button carries in its `value` (JSON-encoded). */
export interface ApprovalButtonValue {
  actionToken: string;
  decision: ApprovalDecision;
}
