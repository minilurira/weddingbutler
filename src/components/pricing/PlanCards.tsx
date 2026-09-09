import Link from "next/link";
import { PLANS, EXTRA_GUEST_FEE, type Plan } from "@/lib/pricing";
import { formatManwon, formatWon } from "@/lib/format";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Badge, buttonClass } from "@/components/ui/Primitives";

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-[7px] h-3 w-3 shrink-0 text-rose-deep"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5 6.2 12 13 4.5" />
    </svg>
  );
}

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`flex h-full flex-col rounded-[20px] border p-7 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 sm:p-8 ${
        plan.highlight
          ? "border-ink/15 bg-white shadow-[0_2px_28px_rgba(26,26,26,.07)]"
          : "border-line bg-white/60 hover:border-ink/15 hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.14em] text-ink-mute">
          {plan.index}
        </span>
        {plan.highlight && <Badge tone="gold">가장 많이 선택</Badge>}
      </div>

      <h3 className="mt-5 text-[22px] font-semibold tracking-tight text-ink">
        {plan.name}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-mute">
        {plan.tagline}
      </p>

      <div className="mt-7 flex items-baseline gap-1.5">
        <span className="text-[34px] font-semibold tracking-tight text-ink">
          {formatManwon(plan.basePrice)}
        </span>
        {plan.priceIsFrom && (
          <span className="text-[15px] text-ink-mute">부터</span>
        )}
      </div>
      <p className="mt-1 text-[12px] text-ink-mute">
        부가세 포함 · {plan.guestRange}
      </p>

      <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line pt-7">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
        <li className="flex gap-2.5 text-[14px] leading-relaxed text-ink-mute">
          <CheckIcon />
          <span>
            {plan.includedGuests}명 초과 시 1명당 {formatWon(EXTRA_GUEST_FEE)}
          </span>
        </li>
      </ul>

      <p className="mt-7 rounded-xl bg-cream-deep/70 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
        {plan.bestFor}
      </p>

      <Link
        href={`/booking?plan=${plan.id}`}
        className={buttonClass(
          plan.highlight ? "primary" : "outline",
          "md",
          "mt-6 w-full",
        )}
      >
        이 요금제로 예약
      </Link>
    </div>
  );
}

export function PlanCards() {
  return (
    <RevealGroup className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <RevealItem key={plan.id} className="h-full">
          <PlanCard plan={plan} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
