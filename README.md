# 웨딩버틀러

결혼식 축의대(축의금 접수대) 대행 서비스 홈페이지.
예비부부가 소개를 보고, 요금을 계산하고, 주말 날짜를 예약하고, 예약금을
결제하는 것까지 온라인에서 모두 끝낼 수 있습니다.

배포 방법은 **[DEPLOY.md](./DEPLOY.md)** 를 봐주세요.

---

## 바로 실행해보기

```bash
npm install
npm run dev        # http://localhost:3000
```

환경변수를 하나도 설정하지 않아도 실행됩니다. 이때 결제는 모의결제 모드로
동작하고, 예약·문의 저장은 안내 문구로 대체됩니다.

```bash
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 검사
npm run lint       # 린트
npm test           # 요금·예약규칙 단위 테스트
```

---

## 기술 스택

| | |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 스타일 | Tailwind CSS v4 |
| 데이터베이스 | Supabase (PostgreSQL) |
| 결제 | 포트원(PortOne) V2 + 토스페이먼츠 |
| 배포 | Vercel |

애니메이션 라이브러리는 쓰지 않습니다. 모든 모션은 CSS 로 처리하며,
`prefers-reduced-motion` 설정과 자바스크립트 실행 여부에 관계없이
**콘텐츠는 항상 보입니다**. (자세한 이유는 아래 "모션 처리 원칙" 참고)

---

## 폴더 구조

```
src/
├── app/
│   ├── page.tsx                 홈
│   ├── service/                 서비스 안내
│   ├── pricing/                 요금제 + 계산기
│   ├── booking/                 예약 (4단계) + 완료 화면
│   ├── qna/                     문의 게시판 (목록/작성/상세)
│   ├── admin/                   관리자 (예약·문의 확인, 답변)
│   ├── policy/                  이용약관·개인정보·환불규정
│   └── api/                     서버 라우트 (아래 참고)
│
├── components/
│   ├── ui/                      Reveal, CountUp, SmartImage, 버튼 등 공통
│   ├── site/                    Header, Footer, 약관 문서 틀
│   ├── home/                    홈 전용 섹션
│   ├── pricing/                 요금제 카드, 요금 계산기
│   ├── booking/                 예약 단계, 달력, 입력 필드
│   ├── qna/                     게시판 화면
│   └── admin/                   로그인, 답변 폼
│
├── lib/
│   ├── pricing.ts          ★ 요금 정책 (요금제·추가요금·예약금)
│   ├── availability.ts     ★ 예약 가능 일시 규칙 (주말·시간대·리드타임)
│   ├── site.ts             ★ 사업자 정보·연락처
│   ├── images.ts           ★ 사진 목록
│   ├── content.ts             화면 문구 모음
│   ├── validation.ts          입력값 검증 (zod)
│   ├── bookings.ts            예약 저장·조회 (서버)
│   ├── qna.ts                 게시판 (서버)
│   ├── supabase.ts            DB 연결 (서버 전용)
│   ├── portone.ts             결제 검증·웹훅 (서버 전용)
│   └── admin.ts               관리자 세션
│
├── types/database.ts            DB 테이블 타입
└── supabase/schema.sql          DB 스키마 (Supabase 에서 실행)
```

★ 표시된 파일이 자주 고치게 되는 것들입니다.

---

## 자주 하는 수정

| 하고 싶은 일 | 고칠 파일 |
|---|---|
| 요금 바꾸기 | `src/lib/pricing.ts` |
| 예약 가능 요일·시간 바꾸기 | `src/lib/availability.ts` |
| 최소 예약 리드타임 바꾸기 | `src/lib/availability.ts` 의 `MIN_LEAD_DAYS` |
| 사업자 정보·전화번호 | `src/lib/site.ts` |
| 사진 교체 | `src/lib/images.ts` |
| FAQ·소개 문구 | `src/lib/content.ts` |
| 환불 기준 | `src/app/policy/refund/page.tsx` |

---

## API 라우트

| 경로 | 하는 일 |
|---|---|
| `GET /api/bookings/availability` | 달력에 표시할 기간별 예약 현황 |
| `POST /api/bookings` | 예약 생성 (결제 대기 상태) |
| `GET /api/bookings/lookup` | 완료 화면에서 예약 내용 조회 |
| `POST /api/payments/complete` | 결제 검증 후 예약 확정 |
| `POST /api/payments/webhook` | 포트원 결제 상태 변경 수신 |
| `POST /api/qna` | 문의 등록 |
| `POST /api/qna/[id]/unlock` | 비밀글 열람 |
| `DELETE /api/qna/[id]` | 문의 삭제 |
| `POST /api/admin/session` | 관리자 로그인 |
| `POST /api/admin/answers` | 관리자 답변 등록 |

---

## 설계에서 지킨 것들

### 결제 금액은 서버가 다시 계산합니다

브라우저가 보낸 금액은 쓰지 않습니다. 예약을 만들 때 요금제·하객 수·추가
버틀러 수만 받아서 서버가 `calculateQuote()` 로 직접 계산하고, 결제 후에도
포트원 서버에 직접 조회해 **승인 금액과 청구 금액이 같은지 대조한 뒤에만**
예약을 확정합니다. (`src/app/api/payments/complete/route.ts`)

### 날짜는 항상 한국 시간 기준입니다

Vercel 서버는 UTC 로 돌기 때문에, `Date` 의 로컬 시간대에 기대면 자정 전후로
"오늘"이 하루 어긋납니다. 그래서 날짜는 `"YYYY-MM-DD"` 문자열로만 다루고
"오늘"은 `Intl` 로 Asia/Seoul 기준으로 구합니다. (`src/lib/availability.ts`)

### 같은 시간에 두 건이 확정되지 않습니다

`bookings` 테이블에 확정 상태(`paid`/`completed`)에만 걸리는 부분 유니크
인덱스를 두어, 동시에 요청이 들어와도 DB 레벨에서 하나만 통과합니다.
결제 중인 예약은 20분간 슬롯을 잡아두고, 그 시간이 지나면 자동으로 풀립니다.

### 데이터베이스는 서버를 통해서만 접근합니다

모든 테이블에 RLS 를 켜고 정책을 만들지 않았습니다. 따라서 공개 키로는
아무것도 읽거나 쓸 수 없고, 서버 라우트에서 `service_role` 키로만 접근합니다.

### 비밀번호는 저장하지 않습니다

문의글 비밀번호는 솔트를 섞은 scrypt 해시로만 저장하며, 비교는 상수 시간
비교를 씁니다. (`src/lib/qna.ts`)

### 모션 처리 원칙

애니메이션이 콘텐츠의 가시성을 좌우하지 않도록 했습니다.

스크롤 등장 효과는 **자바스크립트가 살아 있고, 사용자가 모션을 줄이도록
설정하지 않았을 때만** 적용됩니다. `<html>` 에 `js-reveal` 클래스가 붙고
`prefers-reduced-motion: no-preference` 인 경우에만 요소를 감추기 때문에,
스크립트가 막혀 있거나 접근성 설정을 켠 사용자에게는 처음부터 그냥 보입니다.
(`src/app/globals.css`, `src/components/ui/Reveal.tsx`)

같은 이유로 아코디언 답변도 DOM 에서 제거하지 않고 `grid-template-rows` 로만
접습니다. 브라우저 내 찾기와 번역, 검색엔진이 모든 답변을 읽을 수 있습니다.

### 웹폰트가 늦어도 글이 보입니다

Pretendard 를 렌더 차단 스타일시트로 걸면 CDN 이 느릴 때 본문이 통째로
안 보이는 시간이 생깁니다. 그래서 스크립트로 나중에 붙여 논블로킹으로
만들었습니다. 폰트가 오기 전에는 시스템 한글 폰트로 바로 읽힙니다.

---

## 테스트

```bash
npm test
```

요금 계산(요금제별 경계값, 추가 하객·버틀러, 예약금 10%)과 예약 가능 일시
규칙(주말 제한, 영업시간, 리드타임, 시간대 처리)을 검증합니다.
