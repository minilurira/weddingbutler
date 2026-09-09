import { fail, handleRouteError, ok, readJson } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/admin";
import { addAnswer } from "@/lib/qna";
import { qnaAnswerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/admin/answers — 문의글에 관리자 답변 등록 */
export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return fail("관리자 로그인이 필요합니다.", 401);
    }

    const { postId, content } = qnaAnswerSchema.parse(await readJson(request));
    await addAnswer(postId, content);

    return ok({ postId }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
