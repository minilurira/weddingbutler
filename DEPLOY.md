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

### 3. Point the domain at Vercel (registrar: 후이즈, whois.co.kr)

The domain is currently on 후이즈's default/parking nameserver, which won't
let you add the records above. Two ways to fix it — pick one:

**Option A — delegate nameservers to Vercel (recommended, simplest for an
apex domain).** 후이즈 로그인 → 도메인 관리 → `weddingbutler.co.kr` 선택 →
**네임서버 설정** (or 네임서버 변경) → "사용자 지정 네임서버"로 바꾸고 아래
두 개를 입력:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Vercel then manages all DNS for the domain directly — no separate A/CNAME
records to keep in sync at 후이즈. Vercel's Domains tab will show this as
the recommended setup when you add the domain there.

**Option B — keep 후이즈 as DNS host, add records manually.** 네임서버
설정에서 "후이즈 DNS 사용"(또는 호스팅 없이 DNS 레코드만 사용하는 옵션)을
선택하면 A/CNAME 레코드 편집 화면이 나옵니다. 거기서 호스트 `@`에 A 레코드,
`www`에 CNAME 레코드로 위 표의 값을 추가하세요.

Either way, DNS propagation usually takes minutes to a few hours. Vercel's
Domains tab shows a ✓ once it verifies — that's the signal it's done.

## After setup

Push to `main` → Vercel deploys to production automatically. Once Supabase
and PortOne env vars are set, reservations/contact/payments go live with no
further changes needed.
