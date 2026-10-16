// 고객 축의 기록은 report.weddingbutler.co.kr/<토큰> 으로 연다.
// 실제 화면은 /r/[token] 이고, 미들웨어가 report 도메인 주소를 그쪽으로 이어 준다.

export const REPORT_HOST = "report.weddingbutler.co.kr";
export const REPORT_URL = `https://${REPORT_HOST}`;

export const isReportHost = (host: string | null | undefined) =>
  (host ?? "").split(":")[0].toLowerCase() === REPORT_HOST;

/** 브라우저 주소창 기준 기록 경로. report 도메인이면 /<토큰>, 그 외(미리보기 배포 등)는 /r/<토큰> */
export const recordBasePath = (token: string, host: string | null | undefined) =>
  isReportHost(host) ? `/${token}` : `/r/${token}`;
