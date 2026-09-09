import { fail, handleRouteError, ok, readJson } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/admin";
import { getPostRaw, toDetail, verifyPassword } from "@/lib/qna";
import { qnaPasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/qna/[id]/unlock
 *
 * 비밀글을 비밀번호로 열어본다. 비밀번호가 맞을 때만 본문을 내려보낸다.
 * 관리자로 로그인한 상태라면 비밀번호 없이도 열람할 수 있다.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isInteger(postId) || postId <= 0) {
      return fail("잘못된 요청입니다.", 400);
    }

    const post = await getPostRaw(postId);
    if (!post) return fail("문의글을 찾을 수 없습니다.", 404);

    if (await isAdminAuthenticated()) {
      return ok({ post: await toDetail(post) });
    }

    const { password } = qnaPasswordSchema.parse(await readJson(request));

    if (!(await verifyPassword(password, post.password_hash))) {
      return fail("비밀번호가 일치하지 않습니다.", 403);
    }

    return ok({ post: await toDetail(post) });
  } catch (error) {
    return handleRouteError(error);
  }
}
