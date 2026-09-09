import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin";
import {
  getAdminStats,
  listQnaForAdmin,
  listRecentBookings,
  listUpcomingBookings,
} from "@/lib/admin-data";
import { isDatabaseConfigured } from "@/lib/supabase";
import { LoginForm, LogoutButton } from "@/components/admin/LoginForm";
import { AnswerForm } from "@/components/admin/AnswerForm";
import { QnaNotConfigured } from "@/components/qna/EmptyState";
import { Badge, Container, Section } from "@/components/ui/Primitives";
import { formatDateTime, formatPhone, formatWon } from "@/lib/format";
import { formatKoreanDate, formatKoreanTime } from "@/lib/availability";
import { getPlan } from "@/lib/pricing";
import type { BookingRow } from "@/types/database";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: "gold" | "neutral" | "warn" | "sage" }> = {
  pending: { label: "결제 대기", tone: "neutral" },
  paid: { label: "예약 확정", tone: "gold" },
  completed: { label: "진행 완료", tone: "sage" },
  cancelled: { label: "취소됨", tone: "warn" },
};

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <Shell>
        <div className="rounded-[24px] border border-line bg-white/70 px-8 py-14 text-center">
          <p className="text-[15px] font-medium text-ink">
            관리자 비밀번호가 설정되지 않았습니다.
          </p>
          <p className="mx-auto mt-3 max-w-[48ch] text-[13.5px] leading-relaxed text-ink-soft">
            환경변수 <code className="font-mono">ADMIN_PASSWORD</code> 에
            비밀번호를 설정한 뒤 다시 접속해 주세요. Vercel 에서는 Project
            Settings → Environment Variables 에서 추가할 수 있습니다.
          </p>
        </div>
      </Shell>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <Shell>
        <QnaNotConfigured />
      </Shell>
    );
  }

  const [stats, upcoming, recent, questions] = await Promise.all([
    getAdminStats(),
    listUpcomingBookings(),
    listRecentBookings(),
    listQnaForAdmin(),
  ]);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">
          관리자
        </h1>
        <LogoutButton />
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="다가오는 예식" value={`${stats.upcoming}건`} />
        <StatCard label="누적 확정 예약" value={`${stats.paidTotal}건`} />
        <StatCard
          label="답변 대기 문의"
          value={`${stats.pendingAnswers}건`}
          highlight={stats.pendingAnswers > 0}
        />
      </dl>

      {/* ── 다가오는 예식 ── */}
      <SectionBlock title="다가오는 예식" count={upcoming.length}>
        {upcoming.length === 0 ? (
          <Empty>확정된 예정 예식이 없습니다.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {upcoming.map((booking) => (
              <BookingRowView key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </SectionBlock>

      {/* ── 최근 예약 유입 ── */}
      <SectionBlock title="최근 예약 유입" count={recent.length}>
        {recent.length === 0 ? (
          <Empty>아직 예약 요청이 없습니다.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((booking) => (
              <BookingRowView key={booking.id} booking={booking} compact />
            ))}
          </ul>
        )}
      </SectionBlock>

      {/* ── 문의 ── */}
      <SectionBlock title="문의 게시판" count={questions.length}>
        {questions.length === 0 ? (
          <Empty>등록된 문의가 없습니다.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {questions.map((post) => (
              <li key={post.id} className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  {post.isSecret && <Badge tone="neutral">비밀글</Badge>}
                  {post.isAnswered ? (
                    <Badge tone="gold">답변완료</Badge>
                  ) : (
                    <Badge tone="warn">답변대기</Badge>
                  )}
                  <Link
                    href={`/qna/${post.id}`}
                    className="text-[14.5px] font-medium text-ink underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>

                <p className="mt-1.5 text-[12.5px] text-ink-mute">
                  {post.authorName} · {formatDateTime(post.createdAt)}
                </p>

                <p className="mt-3 whitespace-pre-line rounded-xl bg-ivory-deep/60 px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
                  {post.content}
                </p>

                {!post.isAnswered && <AnswerForm postId={post.id} />}
              </li>
            ))}
          </ul>
        )}
      </SectionBlock>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Section className="pt-32 pb-24 sm:pt-36 sm:pb-32">
      <Container className="max-w-[960px]">{children}</Container>
    </Section>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-6 ${
        highlight ? "border-champagne bg-champagne/[.08]" : "border-line bg-white/60"
      }`}
    >
      <dt className="text-[12.5px] text-ink-mute">{label}</dt>
      <dd className="tabular mt-2 text-[24px] font-semibold tracking-tight text-ink">
        {value}
      </dd>
    </div>
  );
}

function SectionBlock({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">
        {title}
        <span className="tabular ml-2 text-[13px] font-normal text-ink-mute">
          {count}
        </span>
      </h2>
      <div className="mt-4 overflow-hidden rounded-[20px] border border-line bg-white/60">
        {children}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-10 text-center text-[13.5px] text-ink-mute">
      {children}
    </p>
  );
}

function BookingRowView({
  booking,
  compact = false,
}: {
  booking: BookingRow;
  compact?: boolean;
}) {
  const status = STATUS_LABEL[booking.status] ?? {
    label: booking.status,
    tone: "neutral" as const,
  };
  const plan = getPlan(booking.plan_id);

  return (
    <li className="px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status.tone}>{status.label}</Badge>
        <p className="text-[14.5px] font-medium text-ink">
          {formatKoreanDate(booking.event_date)}{" "}
          {formatKoreanTime(booking.event_time)}
        </p>
        <p className="text-[13px] text-ink-mute">
          {plan?.name ?? booking.plan_id}
        </p>
      </div>

      <div className="mt-2 grid gap-x-6 gap-y-1 text-[13px] text-ink-soft sm:grid-cols-2">
        <p>
          <span className="text-ink-mute">예식장</span> {booking.venue_name}
          {booking.venue_address ? ` (${booking.venue_address})` : ""}
        </p>
        <p>
          <span className="text-ink-mute">신랑·신부</span> {booking.groom_name}{" "}
          · {booking.bride_name}
        </p>
        <p>
          <span className="text-ink-mute">연락처</span> {booking.contact_name}{" "}
          {formatPhone(booking.phone)}
        </p>
        <p>
          <span className="text-ink-mute">하객·버틀러</span>{" "}
          {booking.guest_count}명 ·{" "}
          {(plan?.butlers ?? 0) + booking.extra_butlers}명
        </p>
        <p>
          <span className="text-ink-mute">총액</span>{" "}
          {formatWon(booking.total_amount)}{" "}
          <span className="text-ink-mute">
            (예약금 {formatWon(booking.deposit_amount)} / 잔금{" "}
            {formatWon(booking.total_amount - booking.deposit_amount)})
          </span>
        </p>
        {!compact && booking.email && (
          <p>
            <span className="text-ink-mute">이메일</span> {booking.email}
          </p>
        )}
        {compact && (
          <p>
            <span className="text-ink-mute">접수</span>{" "}
            {formatDateTime(booking.created_at)}
          </p>
        )}
      </div>

      {booking.notes && (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-ivory-deep/60 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          {booking.notes}
        </p>
      )}
    </li>
  );
}
