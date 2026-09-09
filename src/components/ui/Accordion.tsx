"use client";

import { useId, useState } from "react";

export type AccordionItem = {
  question: string;
  answer: string;
};

/**
 * 자주 묻는 질문 목록. 한 번에 하나만 열린다.
 *
 * 닫힌 답변도 DOM 에 남겨두고 grid-template-rows 로만 접는다. 그래서
 * 브라우저 내 찾기·번역·검색엔진이 모든 답변을 읽을 수 있고, 애니메이션이
 * 어떤 이유로든 동작하지 않아도 내용이 사라지지 않는다.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-rose-deep"
              >
                <span className="text-[15px] font-medium leading-relaxed text-ink sm:text-base">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={`relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className="absolute h-3.5 w-px bg-current" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={isOpen}
              className="collapsible"
            >
              <div>
                <p
                  className={`max-w-[62ch] whitespace-pre-line pb-7 pr-8 text-[15px] leading-[1.85] text-ink-soft transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
