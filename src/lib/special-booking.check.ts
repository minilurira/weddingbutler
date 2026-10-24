// 실행: npx tsx src/lib/special-booking.check.ts  (가짜 어드민·DB·포트원으로 스페셜 예약 생성·결제 확인 흐름을 점검)
import assert from "node:assert/strict";
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://sb.test"; process.env.SUPABASE_SERVICE_ROLE_KEY = "x";
process.env.PORTONE_API_SECRET = "x"; process.env.ADMIN_API_URL = "http://admin.test/api/public/reservations"; process.env.ADMIN_API_KEY = "k";

const TOKEN = "AbCdEfGhIjKlMnOpQrStUv";
let offer: { state: string; amount: number; label: string } = { state: "open", amount: 1200000, label: "김OO" };
let holdOk = true;
const calls: string[] = []; let inserted: any = null; let insertErr: any = null; let updated: any[] = []; let synced: any = null;
let reservationRow: any = null; let pg = { status: "PAID", amount: { total: 1200000 }, id: "p1", transactionId: "tx1" };

const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
globalThis.fetch = (async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : String(input.url); const method = (init?.method ?? input?.method ?? "GET").toUpperCase();
  if (url.includes("/api/public/special/")) {
    if (method === "GET") return json(offer);
    const b = JSON.parse(init.body); calls.push(`${b.action}:${b.bookingNo.slice(0, 2)}`);
    return json({ ok: b.action === "hold" ? holdOk : true });
  }
  if (url.startsWith("http://admin.test/api/public/availability")) return json({ times: [] });
  if (url === "http://admin.test/api/public/reservations") { synced = JSON.parse(init.body); return json({ id: "x" }, 201); }
  if (url.startsWith("http://sb.test")) {
    if (method === "POST") { if (insertErr) return json(insertErr, 400); inserted = JSON.parse(init.body); return json({ id: "rid-1" }); }
    if (method === "PATCH") { updated.push(JSON.parse(init.body)); return json([]); }
    return json(reservationRow);
  }
  if (url.startsWith("https://api.portone.io/payments/")) return json(pg);
  throw new Error("unexpected fetch " + url);
}) as typeof fetch;

const body = (o: object = {}) => ({ plan: "special", specialToken: TOKEN, year: 2026, month: 11, day: 7, time: "13:00", name: "박준호 · 이서연", side: "both", phone: "010-1234-5678", email: "a@b.co", venue: "더채플", memo: "", guests: 220, extraButlers: 0, payMethod: "신용카드", paymentType: "full", ...o });

(async () => {
  const { NextRequest } = await import("next/server");
  const { POST } = await import("@/app/api/reservations/route");
  const { POST: CONFIRM } = await import("@/app/api/reservations/[id]/confirm/route");
  const post = (b: object) => POST(new NextRequest("http://x/api/reservations", { method: "POST", body: JSON.stringify(b) }));

  // 1) 정상: 금액은 링크에서, 클라이언트가 보낸 값은 무시
  let res: Response = await post(body({ amount: 1, total: 1 } as any));
  let j = await res.json();
  assert.equal(res.status, 200, JSON.stringify(j));
  assert.equal(j.amount, 1200000); assert.match(j.orderName, /스페셜/);
  assert.equal(inserted.plan, "special"); assert.equal(inserted.total_amount, 1200000); assert.equal(inserted.deposit_amount, 1200000);
  assert.equal(inserted.balance_amount, 0); assert.equal(inserted.special_token, TOKEN); assert.equal(inserted.side, "both");
  assert.deepEqual(calls, [`hold:WB`]);

  // 2) 사용 불가 링크 / 점유 실패 / 어드민 불통 / 잘못된 토큰 / 전액 아님 / 테스트 결제
  for (const st of ["used", "expired", "cancelled", "held", "not_found"]) { offer = { ...offer, state: st }; assert.equal((await post(body())).status, 409, st); }
  offer = { ...offer, state: "open" }; holdOk = false; assert.equal((await post(body())).status, 409); holdOk = true;
  assert.equal((await post(body({ specialToken: "short" }))).status, 400);
  assert.equal((await post(body({ specialToken: undefined }))).status, 400);
  assert.equal((await post(body({ paymentType: "deposit" }))).status, 400);
  assert.equal((await post(body({ side: null }))).status, 400);
  assert.equal((await post(body({ day: 4 }))).status, 400);          // 11/4 수요일 — 주말·공휴일이 아님

  // 3) 스페셜용 DB 변경이 아직 적용되지 않은 경우: 안내 문구 + 점유 해제
  calls.length = 0; insertErr = { code: "23514", message: "check violation" };
  res = await post(body()); j = await res.json();
  assert.equal(res.status, 503); assert.match(j.message, /준비가 아직/);
  assert.deepEqual(calls, ["hold:WB", "release:WB"]); insertErr = null;

  // 4) 결제 확인: 금액 일치 → paid, 링크 사용 처리, 어드민에 plan 스페셜 + 총액 전달
  calls.length = 0; updated = [];
  reservationRow = { id: "rid-1", booking_no: "WB20261107-1234", portone_payment_id: "p1", payment_status: "pending", deposit_amount: 1200000, total_amount: 1200000, balance_amount: 0,
    plan: "special", ceremony_year: 2026, ceremony_month: 11, ceremony_day: 7, ceremony_time: "13:00", couple_name: "박준호 · 이서연", side: "both", phone: "010-1234-5678", venue: "더채플", memo: null, guests: 220, pay_method: "신용카드", extra_butlers: 0, special_token: TOKEN };
  const confirm = (paymentId: string) => CONFIRM(new NextRequest("http://x/c", { method: "POST", body: JSON.stringify({ paymentId }) }), { params: { id: "rid-1" } });
  res = await confirm("p1"); j = await res.json();
  assert.equal(j.ok, true, JSON.stringify(j));
  assert.ok(updated.some((u) => u.payment_status === "paid"));
  assert.deepEqual(calls, ["use:WB"]);
  assert.equal(synced.plan, "스페셜"); assert.equal(synced.totalAmount, 1200000); assert.equal(synced.paidAmount ?? synced.depositAmount, 1200000); assert.equal(synced.paymentType, "full"); assert.equal(synced.onsiteAmount, 0);

  // 5) 결제 금액이 다르면 실패 처리하고 점유를 푼다
  calls.length = 0; pg = { ...pg, amount: { total: 1000 } };
  res = await confirm("p1");
  assert.equal(res.status, 402); assert.deepEqual(calls, ["release:WB"]);

  console.log("special booking (homepage): all checks passed");
})().catch((e) => { console.error(e); process.exit(1); });
