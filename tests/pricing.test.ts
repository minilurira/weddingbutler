import { describe, expect, it } from "vitest";
import {
  calculateQuote,
  DEPOSIT_RATE,
  EXTRA_BUTLER_FEE,
  EXTRA_GUEST_FEE,
  MAX_EXTRA_BUTLERS,
  PLANS,
  suggestPlan,
} from "@/lib/pricing";

describe("요금 계산", () => {
  describe("기본 요금", () => {
    it("요금제별 기본가가 안내 문구와 일치한다", () => {
      expect(calculateQuote({ planId: "small", guestCount: 0, extraButlers: 0 }).total).toBe(390_000);
      expect(calculateQuote({ planId: "standard", guestCount: 0, extraButlers: 0 }).total).toBe(450_000);
      expect(calculateQuote({ planId: "premium", guestCount: 0, extraButlers: 0 }).total).toBe(800_000);
    });
  });

  describe("포함 인원 경계값", () => {
    it("스몰케어는 200명까지 추가 요금이 없고 201명부터 붙는다", () => {
      expect(quoteTotal("small", 199)).toBe(390_000);
      expect(quoteTotal("small", 200)).toBe(390_000);
      expect(quoteTotal("small", 201)).toBe(390_000 + EXTRA_GUEST_FEE);
    });

    it("스탠다드는 300명까지 포함이다", () => {
      expect(quoteTotal("standard", 299)).toBe(450_000);
      expect(quoteTotal("standard", 300)).toBe(450_000);
      expect(quoteTotal("standard", 301)).toBe(450_000 + EXTRA_GUEST_FEE);
    });

    it("프리미엄 양가는 양가 합산 400명까지 포함이다", () => {
      expect(quoteTotal("premium", 399)).toBe(800_000);
      expect(quoteTotal("premium", 400)).toBe(800_000);
      expect(quoteTotal("premium", 401)).toBe(800_000 + EXTRA_GUEST_FEE);
    });
  });

  describe("추가 하객 요금", () => {
    it("초과 인원 × 2,000원으로 계산된다", () => {
      const quote = calculateQuote({
        planId: "standard",
        guestCount: 350,
        extraButlers: 0,
      });
      expect(quote.extraGuests).toBe(50);
      expect(quote.extraGuestFee).toBe(100_000);
      expect(quote.total).toBe(550_000);
    });

    it("포함 인원보다 적으면 차감되지 않는다", () => {
      const quote = calculateQuote({
        planId: "standard",
        guestCount: 100,
        extraButlers: 0,
      });
      expect(quote.extraGuests).toBe(0);
      expect(quote.extraGuestFee).toBe(0);
      expect(quote.total).toBe(450_000);
    });
  });

  describe("추가 버틀러", () => {
    it("스탠다드는 1명당 10만원이 붙는다", () => {
      const quote = calculateQuote({
        planId: "standard",
        guestCount: 300,
        extraButlers: 2,
      });
      expect(quote.extraButlerFee).toBe(2 * EXTRA_BUTLER_FEE);
      expect(quote.total).toBe(650_000);
    });

    it("스몰케어는 추가 버틀러를 받지 않으므로 요청해도 0으로 처리된다", () => {
      const quote = calculateQuote({
        planId: "small",
        guestCount: 150,
        extraButlers: 3,
      });
      expect(quote.extraButlers).toBe(0);
      expect(quote.extraButlerFee).toBe(0);
      expect(quote.total).toBe(390_000);
    });

    it("상한을 넘는 요청은 상한으로 깎인다", () => {
      const quote = calculateQuote({
        planId: "premium",
        guestCount: 400,
        extraButlers: 999,
      });
      expect(quote.extraButlers).toBe(MAX_EXTRA_BUTLERS);
    });
  });

  describe("예약금", () => {
    it("총액의 10%다", () => {
      expect(quoteDeposit("small", 200)).toBe(39_000);
      expect(quoteDeposit("standard", 300)).toBe(45_000);
      expect(quoteDeposit("premium", 400)).toBe(80_000);
      expect(DEPOSIT_RATE).toBe(0.1);
    });

    it("추가 요금까지 포함한 총액을 기준으로 한다", () => {
      const quote = calculateQuote({
        planId: "standard",
        guestCount: 350,
        extraButlers: 1,
      });
      expect(quote.total).toBe(650_000);
      expect(quote.deposit).toBe(65_000);
      expect(quote.balance).toBe(585_000);
    });

    it("예약금과 잔금의 합은 항상 총액이다", () => {
      for (const plan of PLANS) {
        for (const guests of [0, 137, 250, 411, 620]) {
          const quote = calculateQuote({
            planId: plan.id,
            guestCount: guests,
            extraButlers: 1,
          });
          expect(quote.deposit + quote.balance).toBe(quote.total);
        }
      }
    });
  });

  describe("잘못된 입력 방어", () => {
    it("음수 하객 수는 0으로 처리한다", () => {
      const quote = calculateQuote({
        planId: "small",
        guestCount: -50,
        extraButlers: 0,
      });
      expect(quote.guestCount).toBe(0);
      expect(quote.total).toBe(390_000);
    });

    it("알 수 없는 요금제는 거부한다", () => {
      expect(() =>
        // @ts-expect-error 런타임에 잘못된 값이 들어오는 상황을 검증한다
        calculateQuote({ planId: "vip", guestCount: 100, extraButlers: 0 }),
      ).toThrow();
    });
  });

  describe("요금제 추천", () => {
    it("하객 수에 맞는 가장 저렴한 요금제를 고른다", () => {
      expect(suggestPlan(150).id).toBe("small");
      expect(suggestPlan(200).id).toBe("small");
      expect(suggestPlan(250).id).toBe("standard");
      expect(suggestPlan(300).id).toBe("standard");
      expect(suggestPlan(450).id).toBe("premium");
    });
  });
});

function quoteTotal(planId: "small" | "standard" | "premium", guests: number) {
  return calculateQuote({ planId, guestCount: guests, extraButlers: 0 }).total;
}

function quoteDeposit(
  planId: "small" | "standard" | "premium",
  guests: number,
) {
  return calculateQuote({ planId, guestCount: guests, extraButlers: 0 }).deposit;
}
