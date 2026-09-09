import { fail, handleRouteError, ok, readJson } from "@/lib/api";
import { isAdminAuthenticated } from "@/lib/admin";
import { deletePost, getPostRaw, verifyPassword } from "@/lib/qna";
import { qnaPasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/qna/[id]
 *
 * 작성자가 자기 글을 지울 때 쓴다. 비밀번호가 맞아야 삭제된다.
 * 관리자는 비밀번호 없이 삭제할 수 있다.
 */
export async function DELETE(
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

    if (!(await isAdminAuthenticated())) {
      const { password } = qnaPasswordSchema.parse(await readJson(request));
      if (!(await verifyPassword(password, post.password_hash))) {
        return fail("비밀번호가 일치하지 않습니다.", 403);
      }
    }

    await deletePost(postId);
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
