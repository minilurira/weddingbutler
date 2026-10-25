// 임시: 홈페이지 소개 영역용 고객 축의 기록 화면 캡처 (데모 토큰, 가상 데이터만 사용)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "public/img/record";
mkdirSync(OUT, { recursive: true });

// 샘플 데이터의 빈칸을 실제 화면처럼 채우고, 데모 표시 띠는 뺀다
const tidy = () => {
  document.querySelector(".wbr-sample-banner")?.remove();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    n.nodeValue = n.nodeValue
      .replace("[예식장명]", "○○웨딩홀")
      .replace("[홀 이름]", "그랜드홀")
      .replace("[대표번호]", "010-5918-9203")
      .replace(/2027년 10월 20일\([^)]*\)/, "2027년 1월 23일(토)");
  }
};

const shots = [
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true },
  { name: "pc", viewport: { width: 1440, height: 900 }, isMobile: false },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: 2, isMobile: s.isMobile, hasTouch: s.isMobile, locale: "ko-KR", timezoneId: "Asia/Seoul" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/r/demo-premium`, { waitUntil: "networkidle" });
  await page.evaluate(tidy);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/${s.name}-summary.png` });
  await page.click("#tab-list");
  await page.waitForTimeout(300);
  await page.evaluate(tidy);
  // 하객 카드가 보이도록 탭 위치까지 내려서 찍는다
  await page.evaluate(() => window.scrollTo(0, document.querySelector(".wbr-bar").getBoundingClientRect().top + window.scrollY - 12));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${s.name}-list.png` });
  await ctx.close();
}
await browser.close();
console.log("done");
