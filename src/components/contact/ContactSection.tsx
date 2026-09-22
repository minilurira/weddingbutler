"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ContactInput } from "@/lib/reservation-types";

declare global {
  interface Window {
    kakaoAsyncInit: () => void;
    Kakao?: { Channel?: { createChatButton: (opts: { container: string }) => void } };
  }
}

const KAKAO_SDK_ID = "kakao-js-sdk";
const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.channel.min.js";
const KAKAO_SDK_INTEGRITY = "sha384-8oNFBbAHWVovcMLgR+mLbxqwoucixezSAzniBcjnEoumhfIbMIg4DrVsoiPEtlnt";

function KakaoChannelButton() {
  useEffect(() => {
    function make() {
      const el = document.getElementById("kakao-talk-channel-chat-button");
      if (!el || el.childElementCount > 0) return;
      try {
        window.Kakao?.Channel?.createChatButton({ container: "#kakao-talk-channel-chat-button" });
      } catch {
        // ignore
      }
    }
    window.kakaoAsyncInit = () => {
      make();
      setInterval(make, 500);
    };

    if (!document.getElementById(KAKAO_SDK_ID)) {
      const js = document.createElement("script");
      js.id = KAKAO_SDK_ID;
      js.src = KAKAO_SDK_SRC;
      js.integrity = KAKAO_SDK_INTEGRITY;
      js.crossOrigin = "anonymous";
      document.body.appendChild(js);
    } else {
      window.kakaoAsyncInit();
    }
  }, []);

  return (
    <div
      id="kakao-talk-channel-chat-button"
      data-channel-public-id="_AlhxnX"
      data-title="consult"
      data-size="small"
      data-color="yellow"
      data-shape="pc"
      data-support-multiple-densities="true"
      style={{ transform: "scale(0.8)", transformOrigin: "left center" }}
    />
  );
}

const TOPICS = ["요금 문의", "지역 문의", "기타"];

interface FormState {
  name: string;
  phone: string;
  date: string;
  area: string;
  topic: string;
  msg: string;
  agree: boolean;
}

const initial: FormState = { name: "", phone: "", date: "", area: "", topic: "요금 문의", msg: "", agree: false };

const chip = (on: boolean): CSSProperties => ({
  padding: "12px 6px",
  textAlign: "center",
  fontSize: 14,
  borderRadius: 3,
  cursor: "pointer",
  userSelect: "none",
  transition: "all .2s ease",
  background: on ? "#33232A" : "#FFFFFF",
  color: on ? "#FFFFFF" : "#473A3F",
  border: "1px solid " + (on ? "#33232A" : "#E2CDD4"),
});

const fieldLabel: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#6B5A60" };
const fieldInput: CSSProperties = { border: "1px solid #E2CDD4", borderRadius: 3, padding: 13, fontSize: 14, color: "#33232A", outline: "none" };

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initial);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = form.name.trim() && form.phone.trim() && form.msg.trim() && form.agree;

  async function send() {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: ContactInput = {
        name: form.name,
        phone: form.phone,
        date: form.date,
        area: form.area,
        topic: form.topic,
        message: form.msg,
        agree: form.agree,
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "문의를 접수하지 못했습니다.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setForm(initial);
    setSent(false);
    setError(null);
  }

  return (
    <section style={{ padding: "0 clamp(18px,5vw,24px) clamp(64px,10vw,100px)" }}>
      <div
        data-mq="split"
        style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 22, alignItems: "start" }}
      >
        <div style={{ background: "#FFFFFF", border: "1px solid #E7D5DA", borderRadius: 6, padding: "clamp(26px,5vw,44px) clamp(20px,5vw,40px)" }}>
          {!sent ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,150px),1fr))", gap: 16 }}>
                <label style={fieldLabel}>
                  성함
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="김민준" className="field-focus" style={fieldInput} />
                </label>
                <label style={fieldLabel}>
                  연락처
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" className="field-focus" style={fieldInput} />
                </label>
                <label style={fieldLabel}>
                  예식 예정일
                  <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} placeholder="2026-11-14" className="field-focus" style={fieldInput} />
                </label>
                <label style={fieldLabel}>
                  예식장 지역
                  <input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="서울 강남 / 경기 성남" className="field-focus" style={fieldInput} />
                </label>
              </div>

              <div style={{ fontSize: 13, color: "#6B5A60", margin: "24px 0 12px" }}>문의 유형</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 8 }}>
                {TOPICS.map((t) => (
                  <div key={t} onClick={() => setForm((f) => ({ ...f, topic: t }))} style={chip(form.topic === t)}>
                    {t}
                  </div>
                ))}
              </div>

              <label style={{ ...fieldLabel, marginTop: 24 }}>
                문의 내용
                <textarea
                  value={form.msg}
                  onChange={(e) => setForm((f) => ({ ...f, msg: e.target.value }))}
                  rows={6}
                  placeholder="하객 규모, 양가 축의대 여부 등 알려주시면 더 정확히 안내드립니다."
                  className="field-focus"
                  style={{ ...fieldInput, resize: "vertical", lineHeight: 1.7 }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, fontSize: 13, color: "#6B5A60", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={() => setForm((f) => ({ ...f, agree: !f.agree }))}
                  style={{ width: 16, height: 16, accentColor: "#A9647E" }}
                />
                개인정보 수집 및 이용에 동의합니다 (문의 응대 목적, 6개월 보관)
              </label>

              <button
                onClick={send}
                disabled={!ready || submitting}
                style={{
                  width: "100%",
                  marginTop: 26,
                  padding: 18,
                  borderRadius: 999,
                  border: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: ready && !submitting ? "pointer" : "default",
                  transition: "all .25s ease",
                  background: ready ? "#33232A" : "#EFE2E5",
                  color: ready ? "#F3E9EB" : "#9A8189",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "전송 중..." : ready ? "문의 보내기" : "필수 항목을 입력해 주세요"}
              </button>
              {error && <p style={{ fontSize: 13, color: "#B0304A", margin: "12px 0 0" }}>{error}</p>}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "#A9647E",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: 24,
                }}
              >
                ✓
              </div>
              <h2 style={{ fontFamily: "var(--font-serif), serif", fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>문의가 접수되었습니다</h2>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 28px" }}>영업일 기준 24시간 내에 남겨주신 연락처로 답변드리겠습니다.</p>
              <button onClick={reset} className="round-nav-hover" style={{ border: "1px solid #E2CDD4", background: "transparent", color: "#6B5A60", padding: "13px 28px", borderRadius: 999, fontSize: 14, cursor: "pointer" }}>
                새 문의 작성
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#33232A", borderRadius: 6, padding: "34px 30px" }}>
            <div style={{ fontFamily: "var(--font-display), serif", fontSize: 13, letterSpacing: "0.34em", color: "#E9CAD1", marginBottom: 20 }}>DIRECT</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,220px),1fr))", gap: "20px 32px", fontSize: 14, color: "#F3E9EB", lineHeight: 1.7 }}>
              <div>
                <div style={{ fontSize: 12, color: "#B79AA3", marginBottom: 4 }}>전화</div>
                <a href="tel:01059189203" style={{ color: "#F3E9EB" }}>
                  010-5918-9203
                </a>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#B79AA3", marginBottom: 4 }}>카카오톡</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                  <span>채널 @웨딩버틀러</span>
                  <KakaoChannelButton />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#B79AA3", marginBottom: 4 }}>상담 시간</div>
                평일 10:00 – 19:00
                <br />
                주말·공휴일은 예식 현장 운영
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
