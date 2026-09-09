"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextInput } from "@/components/booking/Fields";
import { Badge, Button, buttonClass } from "@/components/ui/Primitives";
import { formatDateTime } from "@/lib/format";
import type { QnaPostDetail } from "@/lib/qna";

/** 글 본문 + 답변. 비밀글을 연 뒤에도 같은 화면을 그대로 쓴다. */
export function PostBody({
  post,
  isAdmin = false,
}: {
  post: QnaPostDetail;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [askPassword, setAskPassword] = useState(false);
  const [password, setPassword] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/qna/${post.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setDeleteError(payload?.error ?? "삭제하지 못했습니다.");
        return;
      }

      router.push("/qna");
      router.refresh();
    } catch {
      setDeleteError("네트워크 오류로 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="animate-fade-up">
      <header className="border-b border-line pb-7">
        <div className="flex flex-wrap items-center gap-2">
          {post.isSecret && <Badge tone="neutral">비밀글</Badge>}
          {post.isAnswered ? (
            <Badge tone="gold">답변완료</Badge>
          ) : (
            <Badge tone="neutral">답변대기</Badge>
          )}
        </div>

        <h1 className="mt-4 text-[clamp(1.35rem,3vw,1.85rem)] font-semibold tracking-tight text-ink">
          {post.title}
        </h1>

        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-mute">
          <span>{post.authorName}</span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span className="tabular">조회 {post.viewCount}</span>
        </p>
      </header>

      <div className="whitespace-pre-line py-9 text-[15px] leading-[1.9] text-ink">
        {post.content}
      </div>

      {post.answers.length > 0 && (
        <div className="flex flex-col gap-4">
          {post.answers.map((answer) => (
            <div
              key={answer.id}
              className="rounded-[20px] border border-line bg-white/70 p-6 sm:p-7"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-deep text-[11px] font-semibold text-white">
                  WB
                </span>
                <p className="text-[13.5px] font-semibold text-ink">
                  웨딩버틀러 답변
                </p>
                <p className="ml-auto text-[12px] text-ink-mute">
                  {formatDateTime(answer.createdAt)}
                </p>
              </div>
              <p className="mt-4 whitespace-pre-line text-[14.5px] leading-[1.9] text-ink-soft">
                {answer.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {post.answers.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-line bg-white/40 px-6 py-9 text-center">
          <p className="text-[14px] text-ink-soft">
            아직 답변이 등록되지 않았습니다.
          </p>
          <p className="mt-1.5 text-[13px] text-ink-mute">
            영업일 기준 1일 이내에 답변드리겠습니다.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <Link href="/qna" className={buttonClass("outline", "md")}>
          목록으로
        </Link>

        {askPassword ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            {!isAdmin && (
              <div className="sm:w-56">
                <Field label="비밀번호 확인" error={deleteError ?? undefined}>
                  {(props) => (
                    <TextInput
                      {...props}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="글 작성 시 입력한 비밀번호"
                    />
                  )}
                </Field>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setAskPassword(false);
                  setDeleteError(null);
                }}
              >
                취소
              </Button>
              <Button onClick={handleDelete} disabled={deleting}>
                {deleting ? "삭제 중…" : "삭제 확인"}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setAskPassword(true)}>
            글 삭제
          </Button>
        )}
      </div>

      {deleteError && !askPassword && (
        <p role="alert" className="mt-3 text-[13px] text-[#a8392f]">
          {deleteError}
        </p>
      )}
    </article>
  );
}

/**
 * 비밀글 잠금 화면.
 *
 * 서버는 비밀번호가 맞기 전까지 본문을 아예 내려보내지 않는다.
 * 이 컴포넌트는 잠금을 푼 뒤 받아온 내용을 그대로 PostBody 에 넘긴다.
 */
export function SecretGate({
  postId,
  createdAt,
  authorName,
}: {
  postId: number;
  createdAt: string;
  authorName: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<QnaPostDetail | null>(null);

  async function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/qna/${postId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setError(payload?.error ?? "비밀번호가 일치하지 않습니다.");
        return;
      }

      setPost(payload.post as QnaPostDetail);
    } catch {
      setError("네트워크 오류로 확인하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (post) return <PostBody post={post} />;

  return (
    <div className="rounded-[24px] border border-line bg-white/60 px-7 py-14 sm:px-12">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-6 w-6 text-ink-mute"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="5" y="10.5" width="14" height="9" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <h1 className="mt-6 text-[20px] font-semibold tracking-tight text-ink">
          비밀글입니다
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          작성자 {authorName} · {formatDateTime(createdAt)}
          <br />
          글 작성 시 입력한 비밀번호를 넣어주세요.
        </p>

        <form onSubmit={handleUnlock} className="mt-8 flex flex-col gap-4">
          <Field label="비밀번호" error={error ?? undefined}>
            {(props) => (
              <TextInput
                {...props}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                autoComplete="current-password"
              />
            )}
          </Field>
          <Button type="submit" size="lg" disabled={loading || !password}>
            {loading ? "확인 중…" : "글 보기"}
          </Button>
        </form>

        <Link
          href="/qna"
          className="mt-6 inline-block text-[13px] text-ink-mute underline underline-offset-4 transition-colors hover:text-ink"
        >
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
