# Deploying to weddingbutler.co.kr (Vercel)

Vercel's GitHub integration is already connected to this repo — it builds
and deploys production automatically on every push to
`claude/wedding-butler-website-k1qg8w` (and creates a preview deployment for
every PR). Nothing further is needed to trigger a deploy.

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

Push to `claude/wedding-butler-website-k1qg8w` → Vercel deploys to production automatically. Once Supabase
and PortOne env vars are set, reservations/contact/payments go live with no
further changes needed.

## 배포 승인 게이트 (카카오워크)

Before pushing to the production branch, ask the KakaoWork group for approval:

```
APPROVAL_API_KEY=... node scripts/request-approval.mjs "변경 요약" ["상세 설명"]
```

Put what changed and what it affects in the 상세 설명, one `•` line each
(e.g. `• 예약 폼: 웨딩 날짜 필수` / `• 영향: 신규 예약부터, DB 변경 없음`).
The admin repo has its own copy of the script that calls this same API; its
messages are tagged `[어드민]`, this repo's `[홈페이지]`.

The group gets a message with 승인/거부 buttons. The script waits and exits
`0` on 승인, `1` on 거부 or after 30 minutes with no answer, `2` on error.
Push only when it exits `0`. The result is also posted back to the group.

### One-time setup

1. **KakaoWork bot.** Create a dedicated approval bot in 카카오워크 관리자센터 →
   봇 관리 (separate from the admin's 신규예약봇, since a bot has only one
   Callback URL). Put it in the group that should approve (동업자 포함) and
   get that conversation's id.
2. **Supabase.** Run the `approval_requests` part of `supabase/schema.sql` in
   the SQL editor.
3. **Vercel env (Production).** `KAKAOWORK_APPROVAL_APP_KEY`,
   `KAKAOWORK_APPROVAL_CONVERSATION_ID`, `APPROVAL_API_KEY` (any long random string),
   then redeploy.
4. **Callback URL.** After the deploy that contains `/api/approvals/callback`
   is live, set the bot's Callback URL in 관리자센터 to
   `https://weddingbutler.co.kr/api/approvals/callback`. A bot has a single
   Callback URL, so if the admin's bot already uses one, create a separate bot.
5. **Script env.** Wherever pushes happen (your machine, the Claude
   environment), set `APPROVAL_API_KEY` to the same value. Optional:
   `APPROVAL_API_URL` (default `https://weddingbutler.co.kr`).
6. Run the script once with a test title and press 승인/거부 to check the
   round trip.

The very first deploy of this feature can't go through the gate (the
endpoints don't exist in production yet); every push after setup can.
