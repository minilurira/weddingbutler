"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextArea } from "@/components/booking/Fields";
import { Button } from "@/components/ui/Primitives";

/** 관리자 화면에서 문의글에 바로 답변을 다는 폼 */
export function AnswerForm({ postId }: { postId: number }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setError(payload?.error ?? "답변을 등록하지 못했습니다.");
        return;
      }

      setContent("");
      setDone(true);
      router.refresh();
    } catch {
      setError("네트워크 오류로 등록하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-4 rounded-xl bg-champagne/15 px-4 py-3 text-[13px] text-champagne-deep">
        답변이 등록되었습니다.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <TextArea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="답변을 입력하세요."
        className="min-h-24 text-[14px]"
        maxLength={4000}
      />
      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-[#b4532a]">
          {error}
        </p>
      )}
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? "등록 중…" : "답변 등록"}
        </Button>
      </div>
    </form>
  );
}
