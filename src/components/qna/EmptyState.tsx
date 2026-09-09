import Link from "next/link";
import { buttonClass } from "@/components/ui/Primitives";

/** 글이 하나도 없을 때 */
export function QnaEmpty() {
  return (
    <div className="rounded-[20px] border border-dashed border-line bg-white/40 px-8 py-16 text-center">
      <p className="text-[15px] font-medium text-ink">
        아직 등록된 문의가 없습니다.
      </p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        궁금하신 점을 남겨 주시면 영업일 기준 1일 이내에 답변드립니다.
      </p>
      <Link href="/qna/write" className={buttonClass("primary", "md", "mt-7")}>
        첫 문의 남기기
      </Link>
    </div>
  );
}

/**
 * 데이터베이스가 아직 연결되지 않았을 때.
 *
 * 흰 화면이나 500 에러 대신, 무엇을 하면 되는지 알려주는 편이 낫다.
 */
export function QnaNotConfigured() {
  return (
    <div className="rounded-[20px] border border-line bg-white/60 px-8 py-14 text-center">
      <p className="text-[15px] font-medium text-ink">
        문의 게시판을 준비 중입니다.
      </p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-soft">
        데이터베이스 연결이 아직 완료되지 않았습니다. 급하신 문의는 전화로
        연락 주시면 바로 도와드리겠습니다.
      </p>
      <p className="mt-6 text-[12px] leading-relaxed text-ink-mute">
        (운영자 안내) Supabase 프로젝트를 만들고{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> 환경변수를
        설정한 뒤 <code className="font-mono">supabase/schema.sql</code> 을
        실행해 주세요.
      </p>
    </div>
  );
}
