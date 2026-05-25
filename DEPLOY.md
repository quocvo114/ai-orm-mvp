Deployment checklist for AI-Powered ORM (MVP)

1) Required environment variables (Vercel or hosting):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- AI_PROVIDER ("gemini")
- GEMINI_API_KEY (if using Gemini)
- GOOGLE_PLACES_API_KEY

2) Steps to deploy to Vercel:
- Push to GitHub branch `main`.
- Connect repository to Vercel, set environment variables above in Project Settings (ensure service role key is in "Environment Variables" and marked as "Secret").
- Deploy and verify endpoints: `/api/fetch-place`, `/api/generate`, `/api/reviews`, `/api/reviews/:id/approve`.

3) Post-deploy checks:
- Ensure AI provider key has quota and reachable.
- Ensure Supabase service role key has insert/update access and RLS configured correctly.
- Test flow: enter Place ID → click Lấy đánh giá → click Tạo AI → choose and Duyệt.
