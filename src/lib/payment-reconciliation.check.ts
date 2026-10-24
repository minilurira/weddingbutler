// 실행: npx tsx src/lib/payment-reconciliation.check.ts  (판정 규칙이 깨지면 바로 실패)
import assert from "node:assert/strict";
import { judge } from "./payment-reconciliation";

const pg = (status: string, amount = 100000) => ({ status, amount, cancelledAmount: null });
const v = (db: Parameters<typeof judge>[0], s: string, a = 100000, dbAmount = 100000) => judge(db, dbAmount, pg(s, a)).verdict;

assert.equal(v("paid", "PAID"), "ok");
assert.equal(v("paid", "PAID", 90000), "mismatch");          // 금액 불일치
assert.equal(v("paid", "CANCELLED"), "mismatch");
assert.equal(v("paid", "PARTIAL_CANCELLED"), "mismatch");
assert.equal(v("paid", "NOT_FOUND", 0), "mismatch");
assert.equal(v("pending", "PAID"), "mismatch");              // 결제됐는데 미확정 (웹훅 누락 케이스)
assert.equal(v("failed", "PAID"), "mismatch");
assert.equal(v("pending", "READY", 0), "unpaid");
assert.equal(v("pending", "NOT_FOUND", 0), "unpaid");
assert.equal(v("cancelled", "CANCELLED"), "ok");
assert.equal(v("cancelled", "PARTIAL_CANCELLED"), "ok");     // 부분취소도 취소로 기록되는 현재 동작
assert.equal(v("cancelled", "PAID"), "mismatch");            // 환불 누락
assert.equal(v("cancelled", "READY", 0), "ok");              // 결제 전 취소
console.log("payment-reconciliation: all checks passed");
