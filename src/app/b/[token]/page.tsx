import type { Metadata } from "next";
import { fontSerif } from "@/lib/style";
import { fetchInvite, INVITE_STATE_MESSAGE } from "@/lib/butler-invite";
import InviteResponse from "./InviteResponse";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "버틀러 참석 확인", robots: { index: false, follow: false } };

// 관리자가 알림톡으로 보낸 버틀러 참석 문의 링크. 로그인 없이 참석 가능/불가만 누르면 어드민에 기록되고, 배정은 관리자가 한다.
export default async function ButlerInvitePage({ params }: { params: { token: string } }) {
  const res = await fetchInvite(params.token);
  const state = res?.state;
  const info = res?.info;
  return (
    <main style={{ minHeight: "100vh", background: "#F3E9EB", color: "#33232A", display: "flex", justifyContent: "center", padding: "56px 20px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <p style={{ fontSize: 13, letterSpacing: "0.2em", color: "#A9647E", margin: "0 0 14px" }}>WEDDING BUTLER</p>
        <h1 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: "0 0 22px" }}>참석 가능 여부</h1>
        {!res ? (
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60" }}>링크를 확인하지 못했습니다. 잠시 후 다시 열어 주세요.</p>
        ) : info && (state === "pending" || state === "available" || state === "unavailable") ? (
          <InviteResponse token={params.token} info={info} initial={state} locked={Boolean(res?.locked)} />
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60" }}>{INVITE_STATE_MESSAGE[state === "pending" || state === undefined ? "not_found" : state]}</p>
        )}
        <p style={{ fontSize: 12.5, color: "#A79BA1", margin: "36px 0 0" }}>문의 010-4418-1003</p>
      </div>
    </main>
  );
}
