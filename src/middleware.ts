import { NextResponse, type NextRequest } from "next/server";
import { REPORT_URL, isReportHost } from "@/lib/record-host";

const MAIN_HOSTS = new Set(["weddingbutler.co.kr", "www.weddingbutler.co.kr"]);

// report.weddingbutler.co.kr/<토큰>[/download] → /r/<토큰>[/download] 로 이어 주고,
// 예전 주소 weddingbutler.co.kr/r/<토큰> 은 report 도메인으로 보낸다.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get("host");

  if (isReportHost(host)) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
    }
    if (pathname === "/") return NextResponse.redirect("https://weddingbutler.co.kr/");
    if (pathname.startsWith("/r/")) return NextResponse.redirect(new URL(pathname.slice(2) + search, REPORT_URL), 308);
    // 이미지·폰트 등 정적 파일은 그대로 둔다
    if (pathname.includes(".")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/r${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (MAIN_HOSTS.has((host ?? "").split(":")[0].toLowerCase()) && pathname.startsWith("/r/")) {
    return NextResponse.redirect(new URL(pathname.slice(2) + search, REPORT_URL), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/).*)"],
};
