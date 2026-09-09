# Deploying to weddingbutler.co.kr (Vercel)

Vercel's GitHub integration is already connected to this repo — it builds
and deploys automatically on every push to `main` (and creates a preview
deployment for every PR). Nothing further is needed to trigger a deploy.

`.github/workflows/ci.yml` is a separate CI gate (type-check + build) that
runs on the same events, independent of Vercel's own build — it just flags
the commit/PR status if the app is broken; it does not deploy anything.

## One-time setup still needed

### 1. Set the real environment variables in Vercel

Vercel → Project Settings → Environment Variables, using the same names as
`.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PORTONE_STORE_ID`, `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`, `PORTONE_API_SECRET`

Set these for **Production** (and **Preview** too if you want PR previews to
reach Supabase/PortOne — use test/sandbox keys there, not production keys).
Changing env vars requires a redeploy to take effect (Vercel prompts for this).

### 2. Connect the domain

Vercel → Project Settings → Domains → add `weddingbutler.co.kr` and
`www.weddingbutler.co.kr`. Vercel will show the exact DNS records to create —
use those values (they occasionally change, so prefer what the dashboard
shows over any record copied from elsewhere). As of now that's typically:

| Host | Type | Value |
| --- | --- | --- |
| `@` (apex) | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

### 3. Add those records at your registrar (가비아 / 카페24)

가비아: 마이가비아 → 서비스 관리 → DNS 관리 → 도메인 선택 → 레코드 추가.
카페24: 통합회원 로그인 → 도메인 관리 → DNS 설정 → 가비아와 동일한 방식으로
호스트(`@`, `www`)에 위 레코드를 추가합니다. DNS 전파는 보통 몇 분~수 시간
걸립니다. Vercel의 Domains 탭에서 확인 상태(✓)가 뜨면 완료입니다.

## After setup

Push to `main` → Vercel deploys to production automatically. Once Supabase
and PortOne env vars are set, reservations/contact/payments go live with no
further changes needed.
