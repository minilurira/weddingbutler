import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin";
import {
  getPostRaw,
  incrementViewCount,
  maskName,
  toDetail,
} from "@/lib/qna";
import { isDatabaseConfigured } from "@/lib/supabase";
import { PostBody, SecretGate } from "@/components/qna/PostView";
import { QnaNotConfigured } from "@/components/qna/EmptyState";
import { Container, Section } from "@/components/ui/Primitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isDatabaseConfigured()) return { title: "문의" };

  try {
    const post = await getPostRaw(Number(id));
    if (!post) return { title: "문의" };
    // 비밀글 제목이 검색 결과나 브라우저 탭에 새어나가지 않게 한다.
    return {
      title: post.is_secret ? "비밀글" : post.title,
      robots: { index: false, follow: true },
    };
  } catch {
    return { title: "문의" };
  }
}

export default async function QnaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) notFound();

  if (!isDatabaseConfigured()) {
    return (
      <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <Container className="max-w-[760px]">
          <QnaNotConfigured />
        </Container>
      </Section>
    );
  }

  const post = await getPostRaw(postId);
  if (!post) notFound();

  const isAdmin = await isAdminAuthenticated();

  // 비밀글은 비밀번호를 통과하기 전까지 본문을 서버 밖으로 내보내지 않는다.
  if (post.is_secret && !isAdmin) {
    return (
      <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <Container className="max-w-[760px]">
          <SecretGate
            postId={post.id}
            createdAt={post.created_at}
            authorName={maskName(post.author_name)}
          />
        </Container>
      </Section>
    );
  }

  await incrementViewCount(postId);
  const detail = await toDetail(post);

  return (
    <Section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Container className="max-w-[760px]">
        <PostBody post={detail} isAdmin={isAdmin} />
      </Container>
    </Section>
  );
}
