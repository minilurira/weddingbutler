import type { ApprovalButtonValue, ApprovalStatus } from "@/lib/approval-types";

const API = "https://api.kakaowork.com/v1";

function config() {
  const appKey = process.env.KAKAOWORK_APP_KEY;
  const conversationId = process.env.KAKAOWORK_CONVERSATION_ID;
  if (!appKey || !conversationId) {
    throw new Error(
      "KakaoWork is not configured. Set KAKAOWORK_APP_KEY and KAKAOWORK_CONVERSATION_ID (see .env.example)."
    );
  }
  return { appKey, conversationId };
}

async function send(appKey: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/messages.send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${appKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(`KakaoWork messages.send failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json as { success: true; message?: { id?: string | number } };
}

export interface ApprovalMessageInput {
  actionToken: string;
  title: string;
  description?: string | null;
  commitSha?: string | null;
  commitMessage?: string | null;
  branch?: string | null;
  expiresAt: Date;
}

/**
 * Send the 승인/거부 request to the KakaoWork group. Unlike the admin's
 * notice helper this throws on failure: an approval request nobody received
 * must fail loudly, otherwise the gate silently stops gating.
 */
export async function sendApprovalMessage(
  input: ApprovalMessageInput
): Promise<{ conversationId: string; messageId: string | null }> {
  const { appKey, conversationId } = config();

  const button = (text: string, style: string, decision: ApprovalButtonValue["decision"]) => ({
    type: "button",
    text,
    style,
    action_type: "submit_action",
    action_name: `deploy_${decision}`,
    value: JSON.stringify({ actionToken: input.actionToken, decision } satisfies ApprovalButtonValue),
  });

  const expires = input.expiresAt.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const details = [
    input.branch && `*브랜치* ${input.branch}`,
    input.commitSha && `*커밋* ${input.commitSha.slice(0, 7)}${input.commitMessage ? ` ${input.commitMessage}` : ""}`,
    input.description,
    `${expires}까지 응답이 없으면 자동으로 거부됩니다.`,
  ].filter(Boolean) as string[];

  const json = await send(appKey, {
    conversation_id: conversationId,
    text: `[배포 승인 요청] ${input.title}`,
    blocks: [
      { type: "header", text: "배포 승인 요청", style: "blue" },
      { type: "text", text: input.title, markdown: true },
      ...details.map((text) => ({ type: "text", text, markdown: true })),
      { type: "action", elements: [button("승인", "primary", "approve"), button("거부", "danger", "reject")] },
    ],
  });

  const id = json.message?.id;
  return { conversationId, messageId: id != null ? String(id) : null };
}

const RESULT_TEXT: Record<Exclude<ApprovalStatus, "pending">, string> = {
  approved: "✅ 승인되었습니다. 배포를 진행합니다.",
  rejected: "⛔ 거부되었습니다. 배포하지 않습니다.",
  timeout: "⌛ 30분 동안 응답이 없어 자동으로 거부되었습니다.",
  error: "⚠️ 승인 처리 중 오류가 발생했습니다.",
};

/**
 * Post the outcome back to the group as a follow-up message. Best-effort:
 * the decision is already stored, so a failure here only logs.
 */
export async function sendApprovalResult(
  title: string,
  status: Exclude<ApprovalStatus, "pending">,
  resolvedBy?: string | null
): Promise<void> {
  try {
    const { appKey, conversationId } = config();
    const who = resolvedBy && status !== "timeout" ? ` (${resolvedBy})` : "";
    await send(appKey, { conversation_id: conversationId, text: `${RESULT_TEXT[status]}${who}\n${title}` });
  } catch (err) {
    console.error("[kakaowork] failed to post approval result", err);
  }
}

/** Best-effort lookup of who pressed the button; falls back to the raw user id. */
export async function lookupUserName(userId: string | number): Promise<string> {
  try {
    const { appKey } = config();
    const res = await fetch(`${API}/users.info?user_id=${encodeURIComponent(String(userId))}`, {
      headers: { Authorization: `Bearer ${appKey}` },
    });
    const json = await res.json().catch(() => null);
    const name = json?.user?.name;
    if (typeof name === "string" && name) return name;
  } catch (err) {
    console.error("[kakaowork] users.info failed", err);
  }
  return String(userId);
}
