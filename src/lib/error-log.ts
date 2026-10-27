import { supabaseAdmin } from "@/lib/supabase";

// 서버 오류 기록. console.error처럼 쓰면 Vercel 로그에도 남고, 홈페이지 Supabase의 error_logs 표에도 저장돼 어드민 "오류 기록"에서 볼 수 있다.
//   logError("[invitation pay] verify failed", err)
// 표가 아직 없거나 저장이 실패해도 원래 동작에는 영향이 없다(Vercel 로그에는 항상 남는다).
// 개인정보가 기록에 남지 않게 전화번호·이메일·토큰은 가리고, 같은 오류가 몰릴 때는 일부만 저장한다.

const recent = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;
const MAX_PER_MINUTE = 30;

export function redact(text: string): string {
  return text
    .replace(/\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g, "[전화번호]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[이메일]")
    .replace(/(Bearer|PortOne|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, "$1 [키]")
    .replace(/\b(sk|pk|key|secret|token)[-_A-Za-z0-9]{12,}\b/gi, "[키]");
}

function describe(v: unknown): string {
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}

/** 저장해도 되는 상황인지(같은 메시지는 1분에 한 번, 전체는 1분에 30건까지) */
function allowed(key: string): boolean {
  const now = Date.now();
  if (now - windowStart > 60_000) { windowStart = now; windowCount = 0; }
  if (windowCount >= MAX_PER_MINUTE) return false;
  const last = recent.get(key) ?? 0;
  if (now - last < 60_000) return false;
  recent.set(key, now);
  if (recent.size > 200) recent.clear();
  windowCount++;
  return true;
}

export async function saveErrorLog(source: string, scope: string, message: string, detail = ""): Promise<void> {
  const msg = redact(message).slice(0, 500);
  if (!allowed(`${source}|${scope}|${msg}`)) return;
  try {
    await Promise.race([
      supabaseAdmin().from("error_logs").insert({ source, scope: scope.slice(0, 80), message: msg, detail: redact(detail).slice(0, 2000) }),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // 기록 실패가 서비스에 영향을 주지 않게 한다
  }
}

function split(args: unknown[]): { scope: string; message: string; detail: string } {
  const first = typeof args[0] === "string" ? (args[0] as string) : describe(args[0]);
  const tag = /^\[([^\]]+)\]\s*([\s\S]*)$/.exec(first);
  const rest = args.slice(1).map(describe);
  const err = args.find((a) => a instanceof Error) as Error | undefined;
  return {
    scope: tag ? tag[1] : "",
    message: [tag ? tag[2] : first, ...rest].filter(Boolean).join(" · "),
    detail: err?.stack ?? "",
  };
}

/** console.error 대신 쓴다: Vercel 로그 + 오류 기록 표. 기다리지 않아도 되는(실패해도 무방한) 기록용 */
export function logError(...args: unknown[]): void {
  console.error(...args);
  const { scope, message, detail } = split(args);
  void saveErrorLog("home", scope, message, detail);
}

/** 응답을 보내기 전에 기록 저장까지 기다린다(서버리스에서 응답 뒤에 저장이 끊기지 않게). 중요한 오류용 */
export async function logErrorWait(...args: unknown[]): Promise<void> {
  console.error(...args);
  const { scope, message, detail } = split(args);
  await saveErrorLog("home", scope, message, detail);
}
