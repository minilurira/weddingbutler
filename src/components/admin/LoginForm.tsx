"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput } from "@/components/booking/Fields";
import { Button } from "@/components/ui/Primitives";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setError(payload?.error ?? "로그인에 실패했습니다.");
        return;
      }

      router.refresh();
    } catch {
      setError("네트워크 오류로 로그인하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-[24px] border border-line bg-white/70 p-8">
      <h1 className="text-[20px] font-semibold tracking-tight text-ink">
        관리자 로그인
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        예약 현황과 문의를 확인하려면 로그인이 필요합니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <Field label="비밀번호" error={error ?? undefined}>
          {(props) => (
            <TextInput
              {...props}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          )}
        </Field>
        <Button type="submit" size="lg" disabled={loading || !password}>
          {loading ? "확인 중…" : "로그인"}
        </Button>
      </form>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        router.refresh();
      }}
    >
      로그아웃
    </Button>
  );
}
