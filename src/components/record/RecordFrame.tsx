import Image from 'next/image';

export const SUPPORT_PHONE = '010-5918-9203';

/** 인증·만료·다운로드 전용 화면처럼 기록 본문이 없는 화면의 공통 틀 */
export function RecordFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="wbr">
      <header className="wbr-header">
        <div className="wbr-header__in">
          <span className="wbr-brand">
            <Image src="/brand/wb-logo-96.png" alt="" width={40} height={40} priority />
            웨딩버틀러
          </span>
          <a className="wbr-support" href={`tel:${SUPPORT_PHONE.replace(/[^0-9]/g, '')}`}>
            고객센터 {SUPPORT_PHONE}
          </a>
        </div>
      </header>
      <main className="wbr-main wbr-main--narrow">
        {children}
        <RecordFooter />
      </main>
    </div>
  );
}

export function RecordFooter() {
  return (
    <footer className="wbr-footer">
      웨딩버틀러 · 대표 이강 · 사업자등록번호 677-08-03502 · 통신판매업 제2026-성남분당A-0820호
      <br />
      기록은 버틀러 2인이 상호 확인한 내용이며, 책임 범위는 운영 구역 내 인계확인서 서명 시점까지예요.
    </footer>
  );
}
