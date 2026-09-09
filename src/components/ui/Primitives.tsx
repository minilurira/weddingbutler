import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** 페이지 공통 가로 폭. 모든 섹션이 같은 축에 정렬되도록 한 곳에서 관리한다. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 sm:py-28 lg:py-32 ${className}`}>
      {children}
    </section>
  );
}

/** 섹션 제목 위에 붙는 작은 라벨 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep ${className}`}
    >
      <span aria-hidden className="h-px w-6 bg-rose" />
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-ink ${className}`}
    >
      {children}
    </h2>
  );
}

/**
 * 가운데 정렬 섹션 머리말.
 *
 * 작은 영문 라벨 → 한글 제목 → 설명 순서로, 모든 섹션이 같은 리듬을 갖게 한다.
 */
export function SectionHead({
  label,
  title,
  lead,
  tone = "light",
  className = "",
}: {
  /** 제목 위 작은 영문 라벨 (예: "OUR SERVICE") */
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  /** 어두운 배경 위에 놓일 때는 "dark" */
  tone?: "light" | "dark";
  className?: string;
}) {
  const isDark = tone === "dark";

  return (
    <div className={`mx-auto max-w-[46rem] text-center ${className}`}>
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
          isDark ? "text-rose" : "text-rose-deep"
        }`}
      >
        {label}
      </p>
      <span
        aria-hidden
        className={`mx-auto mt-4 block h-4 w-px ${isDark ? "bg-rose/50" : "bg-rose"}`}
      />
      <h2
        className={`mt-4 text-[clamp(1.6rem,4.4vw,2.5rem)] font-semibold ${
          isDark ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mx-auto mt-5 max-w-[42ch] text-[15px] leading-[1.85] ${
            isDark ? "text-cream/70" : "text-ink-soft"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/** 아이콘 + 제목 + 설명으로 이뤄진 흰 카드. 목록형 섹션의 기본 단위. */
export function IconCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`h-full rounded-[18px] border border-line bg-white p-6 shadow-[0_2px_16px_rgba(59,41,50,.045)] transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(59,41,50,.09)] sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function Lead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mt-5 max-w-[46ch] text-[15px] text-ink-soft sm:text-base ${className}`}>
      {children}
    </p>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "light";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-deep text-white hover:bg-[#9b455d] shadow-[0_1px_2px_rgba(59,41,50,.16)]",
  outline:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[.03]",
  ghost: "text-ink-soft hover:text-ink hover:bg-ink/[.04]",
  light:
    "bg-cream text-ink hover:bg-white shadow-[0_1px_2px_rgba(59,41,50,.16)]",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[13px]",
  md: "h-12 px-6 text-sm",
  lg: "h-[54px] px-8 text-[15px]",
};

const BUTTON_BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-45";

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${BUTTON_BASE} ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-line bg-white/70 p-6 sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "lilac" | "warn";
}) {
  const tones = {
    neutral: "bg-ink/[.05] text-ink-soft",
    gold: "bg-rose/20 text-rose-deep",
    lilac: "bg-lilac/20 text-[#7d5f7e]",
    warn: "bg-[#a8392f]/10 text-[#a8392f]",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** 얇은 구분선 */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-line ${className}`} />;
}
