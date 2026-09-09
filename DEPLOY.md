# 배포 가이드

처음 한 번만 설정하면, 이후에는 코드를 푸시할 때마다 자동으로 배포됩니다.
전체 소요 시간은 대략 20분입니다.

---

## 0. 지금 상태로도 배포됩니다

환경변수를 하나도 채우지 않아도 사이트는 정상적으로 뜹니다.

- 소개·요금제·서비스 페이지: **정상 동작**
- 요금 계산기: **정상 동작**
- 예약 폼과 달력: **정상 동작** (마지막 결제 단계에서 안내 문구 표시)
- 문의 게시판: "준비 중" 안내 표시
- 결제: 모의결제 모드

먼저 배포해서 디자인과 문구를 확인하시고, 그다음에 데이터베이스와 결제를
붙이시는 순서를 권해드립니다.

---

## 1. Vercel 에 올리기 (5분)

1. [vercel.com](https://vercel.com) 에 GitHub 계정으로 로그인합니다.
2. **Add New → Project** 를 누릅니다.
3. `minilurira/weddingbutler` 저장소를 고르고 **Import** 를 누릅니다.
4. Framework Preset 이 **Next.js** 로 잡혔는지만 확인하고 **Deploy** 를 누릅니다.
   빌드 명령이나 출력 폴더는 건드리지 않아도 됩니다.
5. 2~3분 뒤 `https://weddingbutler-xxxx.vercel.app` 주소가 나옵니다.

> 브랜치가 `claude/wedding-butler-website-k1qg8w` 라면, Vercel 은 이 브랜치를
> 프리뷰로 배포합니다. 운영 도메인으로 쓰시려면 이 브랜치를 `main` 에 머지하거나
> Project Settings → Git → Production Branch 를 이 브랜치로 바꾸세요.

---

## 2. 데이터베이스 붙이기 (10분)

예약 내역 저장과 문의 게시판에 필요합니다.

1. [supabase.com](https://supabase.com) 에서 새 프로젝트를 만듭니다.
   리전은 **Northeast Asia (Seoul)** 을 고르세요.
2. 좌측 메뉴 **SQL Editor → New query** 를 엽니다.
3. 이 저장소의 `supabase/schema.sql` 파일 내용을 **전부** 붙여넣고 **Run**.
4. **Project Settings → API** 에서 두 값을 복사합니다.
   - `Project URL`
   - `service_role` (secret 쪽입니다. `anon` 이 아닙니다)
5. Vercel → 프로젝트 → **Settings → Environment Variables** 에 등록합니다.

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | 복사한 Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | 복사한 service_role 키 |

6. **Deployments** 탭에서 최근 배포의 **⋯ → Redeploy** 를 누릅니다.

> `service_role` 키는 모든 접근 제한을 통과하는 열쇠입니다. 이 코드에서는
> 서버 안에서만 쓰이고 브라우저로 나가지 않지만, 다른 곳에 붙여넣거나
> 공유하지 마세요.

---

## 3. 관리자 페이지 열기 (1분)

1. Vercel 환경변수에 `ADMIN_PASSWORD` 를 추가합니다. 충분히 긴 값으로 정하세요.
2. Redeploy 후 `https://<도메인>/admin` 에서 그 비밀번호로 로그인합니다.
3. 다가오는 예식, 최근 예약 유입, 문의 목록을 보고 답변을 달 수 있습니다.

---

## 4. 실제 결제 붙이기

포트원 가입과 토스페이먼츠 계약이 끝난 뒤에 하시면 됩니다.
그 전까지는 모의결제 모드로 예약 흐름 전체를 테스트하실 수 있습니다.

1. [portone.io](https://portone.io) 가입 → 관리자 콘솔에서 **전자결제 신청**
   → 토스페이먼츠 선택. 사업자등록증 등 서류가 필요하며 심사에 며칠 걸립니다.
2. 계약이 끝나면 콘솔 **연동 정보 → 채널 관리**에서 토스페이먼츠 채널을 추가합니다.
3. 아래 값을 Vercel 환경변수에 등록합니다.

   | Name | 어디서 찾나요 |
   |---|---|
   | `NEXT_PUBLIC_PORTONE_STORE_ID` | 콘솔 연동 정보 우측 상단 상점 아이디 |
   | `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | 채널 관리에서 추가한 채널의 채널 키 |
   | `PORTONE_API_SECRET` | 결제 연동 → API Keys → V2 API Secret |
   | `PORTONE_WEBHOOK_SECRET` | 결제 연동 → 웹훅에서 발급 |

4. 콘솔 **결제 연동 → 웹훅**에 아래 주소를 등록합니다.

   ```
   https://<도메인>/api/payments/webhook
   ```

   모바일에서 결제 도중 창을 닫는 경우가 흔한데, 이 웹훅이 있어야 그런 결제도
   누락 없이 예약으로 확정됩니다.

5. Redeploy 하면 그 순간부터 실제 결제로 바뀝니다. 코드 수정은 필요 없습니다.
6. 첫 결제는 **본인 카드로 소액 테스트**한 뒤 콘솔에서 즉시 취소해 보세요.
   예약이 `확정`으로 바뀌는지, 관리자 페이지에 뜨는지 확인하시면 됩니다.

---

## 5. 배포 전에 꼭 채워야 하는 내용

결제가 이뤄지는 사이트는 아래 정보를 반드시 표기해야 합니다
(전자상거래법). 지금은 자리표시자가 들어 있고, 화면 하단에 경고가 뜹니다.

**`src/lib/site.ts`** 의 `BUSINESS` 를 실제 값으로 바꿔주세요.

- 상호, 대표자명
- 사업자등록번호, 통신판매업신고번호
- 사업장 주소, 대표 전화번호, 이메일

그리고 아래 문서도 실제 운영 기준으로 검토해 주세요. 지금은 표준 양식 초안이고,
화면에 "초안" 안내가 표시됩니다.

- `src/app/policy/refund/page.tsx` — **취소·환불 기준** (가장 중요합니다)
- `src/app/policy/terms/page.tsx` — 이용약관
- `src/app/policy/privacy/page.tsx` — 개인정보처리방침

---

## 6. 사진 바꾸기

`src/lib/images.ts` 한 파일에서 전부 관리합니다.
파일 맨 위에 바꾸는 방법이 적혀 있습니다. 사진이 로딩되지 않아도 브랜드
그라디언트로 대체되므로 깨진 이미지가 노출되지는 않습니다.

---

## 자주 겪는 문제

**빌드는 됐는데 문의 게시판이 "준비 중"이라고 나와요**
Supabase 환경변수가 등록되지 않았거나, 등록 후 Redeploy 를 하지 않은 경우입니다.
환경변수는 새로 배포해야 반영됩니다.

**예약하려는데 "예약 시스템 준비가 끝나지 않았습니다"가 떠요**
위와 같은 원인입니다. 2번 항목을 확인해 주세요.

**결제창이 안 뜨고 "테스트 모드" 창이 떠요**
`NEXT_PUBLIC_PORTONE_STORE_ID` 와 `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` 중
하나라도 비어 있으면 모의결제로 동작합니다.

**결제는 됐는데 예약이 확정되지 않았어요**
`PORTONE_API_SECRET` 이 없으면 서버가 결제를 검증하지 못합니다.
웹훅 URL 등록도 함께 확인해 주세요.

**/admin 이 "비밀번호가 설정되지 않았습니다"라고 나와요**
`ADMIN_PASSWORD` 환경변수를 등록하고 Redeploy 하세요.
