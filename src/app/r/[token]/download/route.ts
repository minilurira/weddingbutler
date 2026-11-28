import { cookies } from "next/headers";
import { recordBasePath } from "@/lib/record-host";
import { NextResponse } from "next/server";
import { buildXlsx, type Cell, type Sheet } from "@/lib/xlsx";
import { isEnvelope } from "@/lib/record-stats";
import { getRecordPayload, isRecordToken } from "@/lib/record-api";
import { SESSION_COOKIE, hasCustomerSession, isAdminPreview } from "@/lib/record-session";

export const dynamic = "force-dynamic";

// 신랑측·신부측을 시트(탭)로 나눈 엑셀(.xlsx). 밀봉이면 금액 열이 없다. 명단이 있는 쪽만 시트를 만든다.
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { token } = params;
  if (!isRecordToken(token)) return new NextResponse("Not found", { status: 404 });

  const admin = isAdminPreview(token, new URL(req.url).searchParams.get("admin") ?? undefined);
  if (!admin && !hasCustomerSession(token, cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL(recordBasePath(token, req.headers.get("host")), req.url));
  }

  const payload = await getRecordPayload(token, admin ? "admin" : "customer", { log: false });
  if (!payload) return new NextResponse("기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", { status: 502 });

  const opened = payload.meta.recordMode === "opened";
  const header = ["봉투번호", "구분", "이름", "관계", ...(opened ? ["금액"] : []), "식권", "메모"];
  const widths = [10, 9, 14, 10, ...(opened ? [12] : []), 7, 30];
  const sheets: Sheet[] = (["신랑측", "신부측"] as const)
    .map((side): Sheet | null => {
      const rows = payload.entries.filter((e) => e.side === side).sort((a, b) => a.envelopeNo - b.envelopeNo);
      if (rows.length === 0) return null;
      const body: Cell[][] = rows.map((e) => [e.envelopeNo, e.side, e.name, e.relation ?? "", ...(opened ? [e.amount ?? null] : []), e.tickets, e.memo ?? ""]);
      const envelopes = rows.filter(isEnvelope).length;
      const amount = rows.reduce((a, e) => a + (e.amount ?? 0), 0);
      const tickets = rows.reduce((a, e) => a + e.tickets, 0);
      const total: Cell[] = ["합계", `봉투 ${envelopes}매`, "", "", ...(opened ? [amount] : []), tickets, ""];
      return { name: side, rows: [header, ...body, [], total], widths, boldRows: [0, body.length + 2] };
    })
    .filter((s): s is Sheet => s !== null);
  if (sheets.length === 0) sheets.push({ name: "명단", rows: [header], widths, boldRows: [0] });

  const file = buildXlsx(sheets);
  const filename = `축의기록_${payload.meta.bookingNo}.xlsx`;

  return new NextResponse(Buffer.from(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="record.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
