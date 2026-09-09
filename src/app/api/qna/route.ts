import { handleRouteError, ok, readJson } from "@/lib/api";
import { createPost } from "@/lib/qna";
import { qnaPostSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/qna — 문의 글 등록 */
export async function POST(request: Request) {
  try {
    const input = qnaPostSchema.parse(await readJson(request));
    const id = await createPost({
      title: input.title,
      content: input.content,
      authorName: input.authorName,
      password: input.password,
      isSecret: input.isSecret,
    });

    return ok({ id }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
