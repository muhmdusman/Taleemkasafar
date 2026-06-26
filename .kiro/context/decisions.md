# Decisions Log

## 2026-06-25

### Keep `lib/supabase/`, don't add `utils/supabase/`
The repo already ships Supabase client helpers in `lib/supabase/` using the
newer `getClaims()` + `proxy.ts` pattern. This is preferred over the older
`utils/supabase/middleware.ts` snippet. All code references `@/lib/supabase/*`.

### Use the publishable key, not legacy anon key
Env var is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). Client
helpers already read this. Newer, rotatable, recommended for new apps.

### Auth strategy
Support BOTH:
1. Email + password (already implemented in starter).
2. Google OAuth (PKCE flow via `signInWithOAuth`, callback at
   `/auth/callback/route.ts` exchanging the code for a session).

### Google OAuth — manual setup checklist (dashboard, can't be done via MCP)
To enable Google sign-in, the following must be configured by a human:
1. Google Cloud Console → create OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI:
   `https://lcsuasddoertvoujwsgo.supabase.co/auth/v1/callback`
3. Copy Client ID + Client Secret.
4. Supabase Dashboard → Authentication → Providers → Google → enable, paste
   Client ID + Secret.
5. Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) / production URL later.
   - Redirect URLs: add `http://localhost:3000/**` and the prod equivalent.

### MCP write access
Removed `?read_only=true` so the agent can run migrations and seed data. Keep
RLS enabled on every public table; run `get_advisors` after DDL.


## 2026-06-25 — Local Google OAuth http/https (deferred)

### Symptom
Google OAuth on local dev succeeds (session is set) but the final redirect
lands on `https://localhost:3000` instead of `http://localhost:3000`, giving
`ERR_SSL_PROTOCOL_ERROR` (dev server has no SSL). Persists across Chrome
incognito AND Firefox. Supabase Site URL is correctly `http://localhost:3000`.
App code (callback route + social-buttons redirectTo) correctly uses the
request origin / window.location.origin (http) — no forced https in our code.

### Decision: DEFER (dev-only artifact)
This is a localhost-only http/https mismatch. In PRODUCTION the app is served
over real HTTPS on a real domain, so the redirect back is genuinely https and
works. The error cannot occur in production. Email/password auth works locally
for testing meanwhile. Revisit local Google dev later (likely 127.0.0.1 instead
of localhost, or PKCE/detectSessionInUrl tweak).

### PRODUCTION DEPLOY CHECKLIST (auth URLs) — do at deploy time
Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL = production URL, e.g. https://taleemkasafar.com
- Redirect URLs: add https://<prod-domain>/** , keep http://localhost:3000/** ,
  and (if Vercel) add https://*-<project>.vercel.app/** for preview deploys.
Google Cloud Console OAuth client: Authorized redirect URI stays
https://lcsuasddoertvoujwsgo.supabase.co/auth/v1/callback (unchanged per env).
Also set NEXT_PUBLIC_SITE_URL env in production so server-side emailRedirectTo
uses the right origin.
