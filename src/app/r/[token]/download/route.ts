import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRecordPayload, isRecordToken } from "@/lib/record-api";
import { SESSION_COOKIE, hasCustomerSession, isAdminPreview } from "@/lib/record-session";

export const dynamic = "force-dynamic";

const csvCell = (v: string | number | undefined) => {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// 엑셀에서 바로 열리는 CSV(UTF-8 BOM). 밀봉이면 금액 열이 없다.
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { token } = params;
  if (!isRecordToken(token)) return new NextResponse("Not found", { status: 404 });

  const admin = isAdminPreview(token, new URL(req.url).searchParams.get("admin") ?? undefined);
  if (!admin && !hasCustomerSession(token, cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL(`/r/${token}`, req.url));
  }

  const payload = await getRecordPayload(token, admin ? "admin" : "customer", { log: false });
  if (!payload) return new NextResponse("기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", { status: 502 });

  const opened = payload.meta.recordMode === "opened";
  const header = ["봉투번호", "구분", "이름", "관계", ...(opened ? ["금액"] : []), "식권", "메모"];
  const lines = payload.entries.map((e) =>
    [e.envelopeNo, e.side, e.name, e.relation, ...(opened ? [e.amount] : []), e.tickets, e.memo].map(csvCell).join(",")
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n") + "\r\n";
  const filename = `축의기록_${payload.meta.bookingNo}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="record.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
