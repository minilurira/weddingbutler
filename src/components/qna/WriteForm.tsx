"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Checkbox, Field, TextArea, TextInput } from "@/components/booking/Fields";
import { Button } from "@/components/ui/Primitives";

export function WriteForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [password, setPassword] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (title.trim().length < 2) next.title = "제목을 2자 이상 입력해 주세요.";
    if (content.trim().length < 5) next.content = "내용을 5자 이상 입력해 주세요.";
    if (!authorName.trim()) next.authorName = "성함을 입력해 주세요.";
    if (password.length < 4)
      next.password = "비밀번호는 4자 이상이어야 합니다.";
    if (!agreePrivacy)
      next.agreePrivacy = "개인정보 수집·이용에 동의해 주셔야 합니다.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          authorName,
          password,
          isSecret,
          agreePrivacy,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setSubmitError(payload?.error ?? "문의를 등록하지 못했습니다.");
        return;
      }

      router.push(`/qna/${payload.id}`);
      router.refresh();
    } catch {
      setSubmitError("네트워크 오류로 등록하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="제목" required error={errors.title}>
        {(props) => (
          <TextInput
            {...props}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 평일 예식도 가능한가요?"
            maxLength={120}
          />
        )}
      </Field>

      <Field label="내용" required error={errors.content}>
        {(props) => (
          <TextArea
            {...props}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="예식 날짜와 예상 하객 수를 함께 알려주시면 더 정확히 안내드릴 수 있습니다."
            className="min-h-52"
            maxLength={4000}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="성함" required error={errors.authorName}>
          {(props) => (
            <TextInput
              {...props}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="홍길동"
              maxLength={30}
              autoComplete="name"
            />
          )}
        </Field>

        <Field
          label="비밀번호"
          required
          hint="글을 다시 열어보거나 삭제할 때 필요합니다."
          error={errors.password}
        >
          {(props) => (
            <TextInput
              {...props}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="4자 이상"
              maxLength={64}
              autoComplete="new-password"
            />
          )}
        </Field>
      </div>

      <div className="rounded-2xl border border-line bg-white/60 p-5">
        <Checkbox checked={isSecret} onChange={setIsSecret}>
          <b className="font-semibold text-ink">비밀글로 등록</b> — 목록에서
          제목이 가려지고, 비밀번호를 아는 사람과 담당자만 내용을 볼 수
          있습니다.
        </Checkbox>
      </div>

      <Checkbox
        checked={agreePrivacy}
        onChange={(checked) => {
          setAgreePrivacy(checked);
          setErrors((prev) => ({ ...prev, agreePrivacy: "" }));
        }}
        error={errors.agreePrivacy}
      >
        <b className="font-semibold text-ink">[필수]</b> 문의 응대를 위한
        개인정보 수집·이용에 동의합니다. (수집 항목: 성함, 문의 내용 / 보유
        기간: 답변 완료 후 1년){" "}
        <Link
          href="/policy/privacy"
          target="_blank"
          className="underline decoration-rose underline-offset-4"
        >
          전문 보기
        </Link>
      </Checkbox>

      {submitError && (
        <p
          role="alert"
          className="rounded-xl bg-[#a8392f]/[.08] px-4 py-3 text-[13.5px] text-[#a8392f]"
        >
          {submitError}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-7">
        <Link
          href="/qna"
          className="text-[14px] text-ink-soft transition-colors hover:text-ink"
        >
          목록으로
        </Link>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "등록 중…" : "문의 등록"}
        </Button>
      </div>
    </form>
  );
}
