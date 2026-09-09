import type { ReactNode } from "react";
import { Container, Eyebrow, Section } from "@/components/ui/Primitives";

/**
 * 약관·정책 문서의 공통 틀.
 *
 * 본문은 읽는 문서이므로 폭을 좁히고 줄간격을 넉넉히 둔다.
 */
export function PolicyLayout({
  eyebrow,
  title,
  updatedAt,
  children,
}: {
  eyebrow: string;
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container className="max-w-[720px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-[clamp(1.6rem,3.4vw,2.25rem)] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 text-[13px] text-ink-mute">시행일 {updatedAt}</p>

        <div className="mt-12 flex flex-col gap-10">{children}</div>
      </Container>
    </Section>
  );
}

export function Article({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">
        {heading}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[14.5px] leading-[1.9] text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export function List({ items }: { items: (string | ReactNode)[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-champagne"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** 아직 확정되지 않은 내용임을 분명히 표시한다. */
export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-[#b4532a]/[.07] px-4 py-3 text-[13px] leading-relaxed text-[#b4532a]">
      {children}
    </p>
  );
}
