import { z } from "zod";
import {
  isBookableTime,
  isValidDateString,
  isWeekend,
  earliestBookableDate,
  latestBookableDate,
  MIN_LEAD_DAYS,
} from "@/lib/availability";
import { MAX_EXTRA_BUTLERS, MAX_GUEST_COUNT } from "@/lib/pricing";

/** 010-1234-5678 / 01012345678 둘 다 허용하고, 저장은 숫자만 남긴다. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^0-9]/g, ""))
  .refine((digits) => /^0\d{9,10}$/.test(digits), {
    message: "연락처를 올바르게 입력해 주세요. (예: 010-1234-5678)",
  });

const dateSchema = z
  .string()
  .refine(isValidDateString, { message: "날짜 형식이 올바르지 않습니다." })
  .refine(isWeekend, { message: "예약은 토요일과 일요일만 가능합니다." })
  .refine((date) => date >= earliestBookableDate(), {
    message: `예식일 기준 ${MIN_LEAD_DAYS}일 전까지 예약하실 수 있습니다.`,
  })
  .refine((date) => date <= latestBookableDate(), {
    message: "너무 먼 날짜입니다. 전화로 문의해 주세요.",
  });

const timeSchema = z.string().refine(isBookableTime, {
  message: "예약 시간은 11:00부터 19:00까지 30분 단위로 선택할 수 있습니다.",
});

/**
 * 예약 생성 요청.
 *
 * 금액은 일부러 받지 않는다. 클라이언트가 보낸 금액을 믿으면
 * 결제 금액을 조작할 수 있기 때문에, 서버가 planId·guestCount·extraButlers 로
 * 직접 계산한다.
 */
export const bookingRequestSchema = z.object({
  planId: z.enum(["small", "standard", "premium"]),
  eventDate: dateSchema,
  eventTime: timeSchema,
  guestCount: z.coerce
    .number()
    .int("하객 수는 정수로 입력해 주세요.")
    .min(0)
    .max(MAX_GUEST_COUNT, `하객 수는 ${MAX_GUEST_COUNT}명까지 입력 가능합니다.`),
  extraButlers: z.coerce.number().int().min(0).max(MAX_EXTRA_BUTLERS),

  groomName: z.string().trim().min(1, "신랑 성함을 입력해 주세요.").max(40),
  brideName: z.string().trim().min(1, "신부 성함을 입력해 주세요.").max(40),
  venueName: z.string().trim().min(1, "예식장 이름을 입력해 주세요.").max(120),
  venueAddress: z.string().trim().max(200).optional().or(z.literal("")),

  contactName: z.string().trim().min(1, "연락받으실 분의 성함을 입력해 주세요.").max(40),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email("이메일 형식이 올바르지 않습니다.")
    .max(120)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),

  agreePrivacy: z.literal(true, {
    message: "개인정보 수집·이용에 동의해 주셔야 예약이 가능합니다.",
  }),
  agreeTerms: z.literal(true, {
    message: "이용약관 및 취소·환불규정에 동의해 주셔야 예약이 가능합니다.",
  }),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** 결제 완료 후 서버 검증 요청 */
export const paymentCompleteSchema = z.object({
  paymentId: z.string().trim().min(1).max(120),
});

/** QnA 글 작성 */
export const qnaPostSchema = z.object({
  title: z.string().trim().min(2, "제목을 2자 이상 입력해 주세요.").max(120),
  content: z.string().trim().min(5, "내용을 5자 이상 입력해 주세요.").max(4000),
  authorName: z.string().trim().min(1, "성함을 입력해 주세요.").max(30),
  password: z
    .string()
    .min(4, "비밀번호는 4자 이상이어야 합니다.")
    .max(64, "비밀번호가 너무 깁니다."),
  isSecret: z.boolean().default(false),
  agreePrivacy: z.literal(true, {
    message: "개인정보 수집·이용에 동의해 주셔야 문의를 남기실 수 있습니다.",
  }),
});

/** 비밀글 열람 / 삭제 시 비밀번호 확인 */
export const qnaPasswordSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해 주세요.").max(64),
});

/** 관리자 답변 등록 */
export const qnaAnswerSchema = z.object({
  postId: z.coerce.number().int().positive(),
  content: z.string().trim().min(1, "답변 내용을 입력해 주세요.").max(4000),
});

/** zod 에러를 화면에 그대로 띄울 수 있는 한 줄 메시지로 바꾼다. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "입력값을 다시 확인해 주세요.";
}

/** 필드별 에러 메시지 맵. 폼에서 각 입력 밑에 붙일 때 쓴다. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
