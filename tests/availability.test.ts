import { describe, expect, it } from "vitest";
import {
  addDays,
  allTimeSlots,
  checkDate,
  earliestBookableDate,
  formatKoreanDate,
  formatKoreanTime,
  isBookableDate,
  isBookableTime,
  isValidDateString,
  isWeekend,
  MIN_LEAD_DAYS,
  todayInSeoul,
} from "@/lib/availability";

/** 테스트 기준 시각 — 2026-05-01(금) 한국시간 정오 */
const NOW = new Date("2026-05-01T03:00:00Z");

describe("예약 가능 일시", () => {
  describe("시간대 처리", () => {
    it("UTC 로 전날인 시각도 서울 기준 날짜로 읽는다", () => {
      // UTC 2026-05-01 15:30 = KST 2026-05-02 00:30
      expect(todayInSeoul(new Date("2026-05-01T15:30:00Z"))).toBe("2026-05-02");
      // UTC 2026-05-01 14:30 = KST 2026-05-01 23:30
      expect(todayInSeoul(new Date("2026-05-01T14:30:00Z"))).toBe("2026-05-01");
    });
  });

  describe("요일 제한", () => {
    it("토요일과 일요일만 주말로 본다", () => {
      expect(isWeekend("2026-05-16")).toBe(true); // 토
      expect(isWeekend("2026-05-17")).toBe(true); // 일
      expect(isWeekend("2026-05-18")).toBe(false); // 월
      expect(isWeekend("2026-05-15")).toBe(false); // 금
    });

    it("평일은 예약할 수 없고 사유를 알려준다", () => {
      const result = checkDate("2026-05-20", NOW); // 수요일
      expect(result).toEqual({ ok: false, reason: "weekday-only-weekend" });
    });
  });

  describe("리드타임", () => {
    it("최소 리드타임보다 이른 날짜는 거부한다", () => {
      // 2026-05-02 는 토요일이지만 다음날이라 리드타임 미달
      expect(checkDate("2026-05-02", NOW)).toEqual({
        ok: false,
        reason: "too-soon",
      });
    });

    it("리드타임을 넘긴 첫 주말은 예약할 수 있다", () => {
      const earliest = earliestBookableDate(NOW);
      expect(earliest).toBe(addDays("2026-05-01", MIN_LEAD_DAYS));
      expect(isBookableDate("2026-05-16", NOW)).toBe(true); // 토
      expect(isBookableDate("2026-05-17", NOW)).toBe(true); // 일
    });

    it("너무 먼 날짜는 거부한다", () => {
      expect(checkDate("2028-06-10", NOW)).toEqual({
        ok: false,
        reason: "too-far",
      });
    });
  });

  describe("시간 슬롯", () => {
    it("11:00 부터 19:00 까지 30분 간격으로 만든다", () => {
      const slots = allTimeSlots();
      expect(slots[0]).toBe("11:00");
      expect(slots.at(-1)).toBe("19:00");
      expect(slots).toHaveLength(17);
      expect(slots).toContain("14:30");
    });

    it("영업 시간 밖은 거부한다", () => {
      expect(isBookableTime("11:00")).toBe(true);
      expect(isBookableTime("19:00")).toBe(true);
      expect(isBookableTime("10:30")).toBe(false);
      expect(isBookableTime("19:30")).toBe(false);
      expect(isBookableTime("09:00")).toBe(false);
      expect(isBookableTime("21:00")).toBe(false);
    });

    it("30분 단위가 아니면 거부한다", () => {
      expect(isBookableTime("14:15")).toBe(false);
      expect(isBookableTime("12:01")).toBe(false);
    });

    it("형식이 틀린 값은 거부한다", () => {
      expect(isBookableTime("2시")).toBe(false);
      expect(isBookableTime("25:00")).toBe(false);
      expect(isBookableTime("")).toBe(false);
      expect(isBookableTime(null)).toBe(false);
    });
  });

  describe("날짜 형식 검증", () => {
    it("존재하지 않는 날짜를 걸러낸다", () => {
      expect(isValidDateString("2026-02-30")).toBe(false);
      expect(isValidDateString("2026-13-01")).toBe(false);
      expect(isValidDateString("2026-2-1")).toBe(false);
      expect(isValidDateString("아무거나")).toBe(false);
      expect(isValidDateString("2026-02-28")).toBe(true);
    });

    it("윤년 2월 29일은 통과시킨다", () => {
      expect(isValidDateString("2028-02-29")).toBe(true);
      expect(isValidDateString("2026-02-29")).toBe(false);
    });
  });

  describe("한국어 표기", () => {
    it("날짜에 요일을 붙인다", () => {
      expect(formatKoreanDate("2026-05-16")).toBe("2026년 5월 16일 (토)");
      expect(formatKoreanDate("2026-05-17")).toBe("2026년 5월 17일 (일)");
    });

    it("시간을 오전/오후로 표기한다", () => {
      expect(formatKoreanTime("11:00")).toBe("오전 11시");
      expect(formatKoreanTime("12:00")).toBe("오후 12시");
      expect(formatKoreanTime("14:30")).toBe("오후 2시 30분");
      expect(formatKoreanTime("19:00")).toBe("오후 7시");
    });
  });
});
