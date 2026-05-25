# ai-orm-mvp

Lightweight MVP that automates reply drafts for Google Maps reviews. Designed for quick experiments and demos — not production-ready.

What it does
- Fetches reviews from Google Places (Place ID).
- Stores and lists reviews in Supabase.
- Generates 3 reply suggestions per review using an AI provider (Gemini).
- Lets an operator review and mark replies as approved.

Tech stack
- Next.js (app router) + React
- Tailwind CSS for styling
- Supabase (client + server client)
- AI adapter: `lib/ai.ts` (supports Gemini/OpenAI)

Status
- Core flows implemented: fetch -> generate -> approve
- Fallback generation available when AI provider is unavailable
- Requires API keys to test full end-to-end


## Quick start

1. Clone

```bash
git clone <repo-url>
cd ai-orm-mvp
```

2. Install

```bash
npm install
# if you hit peer-deps errors (common when adding packages):
npm install --legacy-peer-deps
```

3. Create `.env.local` (example)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   
AI_PROVIDER=gemini             
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_PLACES_API_KEY=...
```

4. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Important files
- `app/page.tsx` — dashboard UI (Place ID input, filters, list, generate/approve actions)
- `app/api/generate/route.ts` — generate suggestions via `lib/ai.ts`
- `app/api/fetch-place/route.ts` — fetch reviews from Google Places
- `app/api/reviews/route.ts` — read reviews (Supabase)
- `app/api/reviews/[id]/approve/route.ts` — approve endpoint (updates Supabase)
- `lib/ai.ts` — AI adapter (Gemini/OpenAI + fallback)
- `lib/supabase.ts` / `lib/supabaseServer.ts` — Supabase clients

---

## API endpoints (tóm tắt)
- POST `/api/fetch-place` — body: `{ placeId }` → trả về `{ reviews: [...] }` (gọi Google Places)
- POST `/api/generate` — body: `{ review: { text, rating, author }, reviewId? }` → trả về `{ suggestions }` (3 gợi ý theo tone)
- GET `/api/reviews` — trả về review hiện có (limit 20)
- POST `/api/reviews/:id/approve` — đánh dấu review `Đã giải quyết` (cập nhật DB nếu có service key)

---

## Development notes & troubleshooting
- Nếu `npm install` báo lỗi peer-deps (ERESOLVE) khi thêm package mới: dùng `npm install --legacy-peer-deps`.
- Nếu `npm run dev` bị lỗi và exit code 1:
	- Kiểm tra `NEXT_PRIVATE`/`SUPABASE_SERVICE_ROLE_KEY` nếu code cố gắng dùng server-only key.
	- Xem logs trong terminal để biết file/line gây lỗi.
	- Xóa thư mục `.next` rồi chạy lại nếu cần: `rm -rf .next && npm run dev` (Windows PowerShell: `Remove-Item -Recurse -Force .next`).
- Khi dùng Gemini: model name và quota có thể gây 404/429 — kiểm tra model hiện có trong console Google Cloud và key hợp lệ.

---

## Testing
- Có sẵn `scripts/test-gemini.mjs` để thử gọi Gemini (tham khảo trong repo).
- Bạn có thể mock AI bằng cách không đặt `GEMINI_API_KEY`/`OPENAI_API_KEY` và API sẽ trả fallback suggestions.

---

## Deployment
- Xem file `DEPLOY.md` trong repo cho checklist triển khai (Azure / Vercel / Netlify tuỳ lựa chọn).

---


