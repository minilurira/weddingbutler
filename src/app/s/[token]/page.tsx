import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import SpecialBooking from "@/components/SpecialBooking";
import { fontSerif } from "@/lib/style";
import { fetchSpecialOffer, SPECIAL_STATE_MESSAGE } from "@/lib/special-offer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "스페셜 예약",
  robots: { index: false, follow: false },
};

// 관리자가 만들어 보낸 스페셜 예약 링크. 날짜·시간·예식장을 고르고 정해진 금액을 전액 결제한다.
export default async function SpecialPage({ params }: { params: { token: string } }) {
  const offer = await fetchSpecialOffer(params.token);
  const problem = !offer
    ? "링크를 확인하지 못했습니다. 잠시 후 다시 열어 주세요."
    : offer.state !== "open"
      ? SPECIAL_STATE_MESSAGE[offer.state]
      : "";

  return (
    <div style={{ width: "100%", overflowX: "hidden", background: "#F3E9EB", color: "#33232A" }}>
      <Header />
      {problem || !offer ? (
        <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(60px,12vw,120px) 20px", textAlign: "center" }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontFamily: fontSerif, fontSize: 24, fontWeight: 600, margin: "0 0 14px" }}>예약 링크를 사용할 수 없습니다</h1>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#6B5A60", margin: "0 0 26px" }}>{problem}</p>
            <Link href="/" style={{ display: "inline-block", background: "#33232A", color: "#F3E9EB", padding: "14px 30px", borderRadius: 999, fontSize: 14 }}>홈으로 돌아가기</Link>
          </div>
        </div>
      ) : (
        <SpecialBooking token={params.token} amount={offer.amount} label={offer.label} />
      )}
      <Footer />
    </div>
  );
}
