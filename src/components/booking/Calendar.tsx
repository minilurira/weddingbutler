"use client";

import { useMemo } from "react";
import {
  allTimeSlots,
  earliestBookableDate,
  formatDateString,
  isWeekend,
  latestBookableDate,
  parseDateString,
  type DateString,
} from "@/lib/availability";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export type CalendarProps = {
  /** 현재 보고 있는 달의 1일 ("YYYY-MM-01") */
  month: DateString;
  onMonthChange: (month: DateString) => void;
  selected: DateString | null;
  onSelect: (date: DateString) => void;
  /** 날짜별로 이미 찬 시간대 */
  taken: Record<string, string[]>;
  loading?: boolean;
};

type DayCell = {
  date: DateString;
  day: number;
  weekday: number;
  inMonth: boolean;
  selectable: boolean;
  soldOut: boolean;
};

function addMonths(month: DateString, delta: number): DateString {
  const d = parseDateString(month);
  d.setUTCMonth(d.getUTCMonth() + delta, 1);
  return formatDateString(d);
}

export function Calendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  taken,
  loading = false,
}: CalendarProps) {
  const totalSlots = allTimeSlots().length;
  const earliest = earliestBookableDate();
  const latest = latestBookableDate();

  const cells = useMemo<DayCell[]>(() => {
    const first = parseDateString(month);
    const year = first.getUTCFullYear();
    const monthIndex = first.getUTCMonth();

    // 달력은 항상 일요일에서 시작하도록 앞을 채운다.
    const start = new Date(Date.UTC(year, monthIndex, 1));
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    return Array.from({ length: 42 }, (_, offset) => {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + offset);
      const date = formatDateString(current);
      const soldOut = (taken[date]?.length ?? 0) >= totalSlots;

      return {
        date,
        day: current.getUTCDate(),
        weekday: current.getUTCDay(),
        inMonth: current.getUTCMonth() === monthIndex,
        selectable:
          isWeekend(date) && date >= earliest && date <= latest && !soldOut,
        soldOut,
      };
    });
  }, [month, taken, totalSlots, earliest, latest]);

  // 마지막 주가 통째로 다음 달이면 표시하지 않는다 (달력이 6줄로 길어지는 것 방지)
  const visibleCells = cells.slice(
    0,
    cells.slice(35).every((cell) => !cell.inMonth) ? 35 : 42,
  );

  const canGoPrev = addMonths(month, -1) >= earliest.slice(0, 7) + "-01";
  const canGoNext = addMonths(month, 1) <= latest;

  const [year, monthNum] = month.split("-");

  return (
    <div className="rounded-[20px] border border-line bg-white/70 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={!canGoPrev}
          aria-label="이전 달"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.05] disabled:opacity-25"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>

        <p aria-live="polite" className="text-[15px] font-semibold tracking-tight text-ink">
          {year}년 {Number(monthNum)}월
        </p>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={!canGoNext}
          aria-label="다음 달"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.05] disabled:opacity-25"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`pb-2 text-center text-[11px] font-semibold ${
              index === 0 || index === 6 ? "text-ink-soft" : "text-ink-mute/50"
            }`}
          >
            {label}
          </div>
        ))}

        {/* key 가 바뀌면 다시 마운트되면서 페이드가 한 번 재생된다 */}
        <div
          key={month}
          className="animate-fade-in col-span-7 grid grid-cols-7 gap-1"
        >
            {visibleCells.map((cell) => {
              const isSelected = cell.date === selected;

              if (!cell.inMonth) {
                return <div key={cell.date} aria-hidden className="h-11" />;
              }

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={!cell.selectable}
                  onClick={() => onSelect(cell.date)}
                  aria-pressed={isSelected}
                  aria-label={`${Number(monthNum)}월 ${cell.day}일${
                    cell.selectable ? "" : " (예약 불가)"
                  }`}
                  className={`relative flex h-11 items-center justify-center rounded-xl text-[14px] transition-all duration-200 ${
                    isSelected
                      ? "bg-rose-deep font-semibold text-white"
                      : cell.selectable
                        ? "text-ink hover:bg-rose/20"
                        : "cursor-not-allowed text-ink-mute/35"
                  }`}
                >
                  <span className="tabular">{cell.day}</span>
                  {cell.soldOut && cell.date >= earliest && isWeekend(cell.date) && (
                    <span className="absolute bottom-1.5 text-[9px] font-medium text-ink-mute/60">
                      마감
                    </span>
                  )}
                  {cell.selectable && !isSelected && (
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 h-1 w-1 rounded-full bg-rose"
                    />
                  )}
                </button>
              );
          })}
        </div>
      </div>

      <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[12px] text-ink-mute">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose" />
        예약 가능한 날 (토·일요일만)
        {loading && <span className="ml-auto">현황 불러오는 중…</span>}
      </p>
    </div>
  );
}
