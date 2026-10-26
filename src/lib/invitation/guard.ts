import crypto from "crypto";

// 방명록 보호: 욕설·광고 걸러내기, 비밀번호 해시, IP 해시(원래 IP는 저장하지 않는다).

// ponytail: 짧은 금칙어 목록. 우회 표기(띄어쓰기·특수문자 섞기)까지 막으려면 외부 필터 API를 붙인다.
const BAD_WORDS = ["시발", "씨발", "ㅅㅂ", "병신", "ㅂㅅ", "지랄", "개새", "좆", "꺼져", "닥쳐", "미친놈", "미친년"];
const AD_PATTERNS = [/https?:\/\//i, /www\./i, /\.(com|net|kr|co|io|me|ly)\b/i, /오픈\s*채팅/, /카톡\s*(아이디|id)/i, /텔레그램/, /대출/, /코인/, /도박|카지노|토토/];

/** 등록하면 안 되는 글이면 그 이유, 괜찮으면 null */
export function guestbookProblem(name: string, message: string): string | null {
  const text = `${name} ${message}`;
  const compact = text.replace(/[\s.\-_*~!@#$%^&()]/g, "");
  if (BAD_WORDS.some((w) => compact.includes(w))) return "profanity";
  if (AD_PATTERNS.some((re) => re.test(text))) return "advertising";
  return null;
}

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(12).toString("base64url");
  const hash = crypto.scryptSync(pw, salt, 32).toString("base64url");
  return `${salt}.${hash}`;
}

export function checkPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(".");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash);
  const b = Buffer.from(crypto.scryptSync(pw, salt, 32).toString("base64url"));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashIp(ip: string, secret: string): string {
  return crypto.createHmac("sha256", secret || "wb").update(`ip.${ip}`).digest("base64url").slice(0, 22);
}

/** 공개 주소 코드: 헷갈리는 글자(0 O 1 l I)를 뺀 8자 */
export function newSlug(): string {
  const chars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
