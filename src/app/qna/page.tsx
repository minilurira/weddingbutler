import type { Metadata } from "next";
import Link from "next/link";
import { listPosts, QNA_PAGE_SIZE, type QnaListResult } from "@/lib/qna";
import { isDatabaseConfigured } from "@/lib/supabase";
import { QnaEmpty, QnaNotConfigured } from "@/components/qna/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import {
  Badge,
  buttonClass,
  Container,
  Eyebrow,
  Lead,
  Section,
  SectionTitle,
} from "@/components/ui/Primitives";
import { formatDateOnly } from "@/lib/format";

export const metadata: Metadata = {
  title: "문의 게시판",
  description:
    "웨딩버틀러 축의대 대행 서비스에 대해 궁금한 점을 남겨 주세요. 영업일 기준 1일 이내에 답변드립니다.",
};

export const dynamic = "force-dynamic";

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 text-ink-mute"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3.5" y="7" width="9" height="6" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

export default async function QnaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  let result: QnaListResult | null = null;
  let loadError: string | null = null;

  if (isDatabaseConfigured()) {
    try {
      result = await listPosts(currentPage);
    } catch (error) {
      console.error("[qna] 목록 조회 실패:", error);
      loadError = "문의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }
  }

  return (
    <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>문의 게시판</Eyebrow>
            <SectionTitle>궁금한 점을 남겨 주세요.</SectionTitle>
            <Lead>
              영업일 기준 1일 이내에 답변드립니다. 공개하고 싶지 않은 내용은
              비밀글로 남기시면 작성자와 담당자만 볼 수 있습니다.
            </Lead>
          </Reveal>

          <Reveal delay={0.08}>
            <Link href="/qna/write" className={buttonClass("primary", "md")}>
              문의 남기기
            </Link>
          </Reveal>
        </div>

        <div className="mt-14">
          {!isDatabaseConfigured() ? (
            <QnaNotConfigured />
          ) : loadError ? (
            <div className="rounded-[20px] border border-line bg-white/60 px-8 py-14 text-center text-[14px] text-ink-soft">
              {loadError}
            </div>
          ) : !result || result.items.length === 0 ? (
            <QnaEmpty />
          ) : (
            <>
              {/* 데스크톱: 표 / 모바일: 카드 목록 */}
              <div className="overflow-hidden rounded-[20px] border border-line bg-white/60">
                <div className="hidden grid-cols-[64px_1fr_120px_110px_72px] gap-4 border-b border-line px-6 py-3.5 text-[12px] font-semibold text-ink-mute sm:grid">
                  <span>번호</span>
                  <span>제목</span>
                  <span>작성자</span>
                  <span>작성일</span>
                  <span className="text-right">조회</span>
                </div>

                <ul className="divide-y divide-line">
                  {result.items.map((post, index) => {
                    const displayNumber =
                      result.total - (result.page - 1) * QNA_PAGE_SIZE - index;

                    return (
                      <li key={post.id}>
                        <Link
                          href={`/qna/${post.id}`}
                          className="group grid gap-1.5 px-6 py-4 transition-colors hover:bg-rose/[.07] sm:grid-cols-[64px_1fr_120px_110px_72px] sm:items-center sm:gap-4"
                        >
                          <span className="tabular hidden text-[13px] text-ink-mute sm:block">
                            {displayNumber}
                          </span>

                          <span className="flex items-center gap-2">
                            {post.isSecret && <LockIcon />}
                            <span className="text-[14.5px] font-medium text-ink transition-colors group-hover:text-rose-deep">
                              {post.isSecret ? "비밀글입니다" : post.title}
                            </span>
                            {post.isAnswered && (
                              <Badge tone="gold">답변완료</Badge>
                            )}
                          </span>

                          <span className="text-[13px] text-ink-soft">
                            <span className="sm:hidden">
                              {post.authorName} ·{" "}
                            </span>
                            <span className="hidden sm:inline">
                              {post.authorName}
                            </span>
                            <span className="sm:hidden">
                              {formatDateOnly(post.createdAt)}
                            </span>
                          </span>

                          <span className="tabular hidden text-[13px] text-ink-mute sm:block">
                            {formatDateOnly(post.createdAt)}
                          </span>

                          <span className="tabular hidden text-right text-[13px] text-ink-mute sm:block">
                            {post.viewCount}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {result.pageCount > 1 && (
                <nav
                  aria-label="페이지 이동"
                  className="mt-8 flex justify-center gap-1.5"
                >
                  {Array.from({ length: result.pageCount }, (_, index) => {
                    const pageNumber = index + 1;
                    const active = pageNumber === result.page;
                    return (
                      <Link
                        key={pageNumber}
                        href={`/qna?page=${pageNumber}`}
                        aria-current={active ? "page" : undefined}
                        className={`tabular flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[13px] transition-colors ${
                          active
                            ? "bg-rose-deep font-semibold text-white"
                            : "text-ink-soft hover:bg-ink/[.05]"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
