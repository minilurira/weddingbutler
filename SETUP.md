# Wedding Butler — setup

This is the production Next.js implementation of the `project/*.dc.html` designs
(see `README.md` / `chats/chat1.md` for the original design handoff).

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Pages: `/` (home), `/service`, `/pricing`, `/contact`. The reservation modal is
mounted once globally (`src/components/ReservationProvider.tsx`) and opened
from any page's "예약하기" button.

## Required setup before payments/reservations work

### 1. Supabase (reservations + contact messages)

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor — creates `reservations` and
   `contact_messages` with RLS enabled and **no** public policies. All reads
   and writes happen server-side (Next.js API routes) via the service role
   key, so PII is never reachable directly from the browser.
3. Copy `NEXT_PUBLIC_SUPABASE_URL` and the **service role** key (Settings →
   API) into `.env.local`.

### 2. PortOne + Toss Payments (50% deposit checkout)

1. In the PortOne dashboard, add a payment channel connected to your Toss
   Payments merchant account.
2. Copy the store ID and that channel's key into
   `NEXT_PUBLIC_PORTONE_STORE_ID` / `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`.
3. Copy the V2 API secret into `PORTONE_API_SECRET` (server-only — used in
   `src/lib/portone.ts` to verify each payment against PortOne's REST API
   before a reservation is ever marked "paid").

Until these are set, the booking flow works end-to-end in the UI but the
final payment step will show a clear inline error instead of crashing.

## SEO (Google / Naver)

Already in the code, live as soon as it's deployed:

- Per-page `<title>`/description, Open Graph + Twitter card tags, canonical
  URLs (`src/app/layout.tsx` + each page's `metadata` export).
- `robots.txt` and `sitemap.xml` (`src/app/robots.ts`, `src/app/sitemap.ts`) —
  auto-generated, list all 4 pages, allow all crawlers except `/api/`.
- `LocalBusiness` structured data (`src/components/LocalBusinessJsonLd.tsx`)
  using the real business info from the footer (name, address, email) — this
  is what lets Google/Naver show a rich business card instead of a plain link.

Two things only you can do, since they require your own Google/Naver accounts:

### 1. Google Search Console

1. Go to search.google.com/search-console → Add property → `weddingbutler.co.kr`.
2. Verify ownership via the "HTML tag" method — it gives you a `content="..."`
   value. Put just that value in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in
   Vercel's env vars, then redeploy.
3. Once verified, submit `https://weddingbutler.co.kr/sitemap.xml` under
   Sitemaps so Google crawls all pages promptly instead of waiting to
   discover them organically.

### 2. Naver Search Advisor (네이버 서치어드바이저)

1. Go to searchadvisor.naver.com → 사이트 등록 → `weddingbutler.co.kr`.
2. Verify via the HTML 태그 method the same way — put the value in
   `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` in Vercel, redeploy.
3. Submit the sitemap URL there too, and use "요청 > 웹페이지 수집" to ask
   Naver to crawl the site now instead of waiting.

Naver also has a separate **네이버 플레이스/스마트플레이스** listing for
local businesses (map search, business hours, phone) — that's a distinct
registration from search-engine indexing and isn't something code affects;
worth doing separately at business.naver.com if useful for this business.

## Where things live

- `src/app/{page,service,pricing,contact}` — the four routes.
- `src/components/ReservationModal.tsx` — shared booking flow (plan, date,
  time, guest/butler count, payment method, live price summary).
- `src/lib/plans.ts` — pricing rules (base price, per-guest overage, extra
  butlers, 50% deposit split) shared by the pricing page and the modal.
- `src/app/api/reservations`, `src/app/api/contact` — server routes that
  write to Supabase and verify PortOne payments.
