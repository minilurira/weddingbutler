export type ApprovalStatus = "pending" | "approved" | "rejected" | "timeout" | "error";

export type ApprovalDecision = "approve" | "reject";

/** Which site the deploy is for; shown as a [홈페이지]/[어드민] tag on the message. */
export type ApprovalProject = "homepage" | "admin";

export interface CreateApprovalInput {
  title: string;
  project?: ApprovalProject;
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
