# Supabase (frontend auth)

This app uses [Supabase Auth](https://supabase.com/docs/guides/auth) from the Vite frontend.

## 1. Create a project

In the [Supabase dashboard](https://supabase.com/dashboard), create a project and open **Project Settings → API**.

## 2. Environment variables

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_SUPABASE_URL` — **Project URL**
- `VITE_SUPABASE_ANON_KEY` — **anon public** key (safe in the browser; never put the **service_role** key in the frontend)

Restart `npm run dev` after changing `.env`.

## 3. Auth URLs (important)

In **Authentication → URL configuration**:

- **Site URL**: e.g. `http://localhost:5173` for local dev, or your production origin.
- **Redirect URLs**: add:
  - `http://localhost:5173`
  - `http://localhost:5173/`
  - `http://localhost:5173/login` (password recovery email link)

Add the same patterns for production when you deploy.

## 4. OAuth (optional)

To use **Google** or **GitHub** on the auth page:

1. **Authentication → Providers** — enable Google and/or GitHub and follow the provider setup (client ID/secret in Supabase).
2. Ensure the redirect URLs above include your app origin so users return after OAuth.

## 5. Email templates

Sign-up may require **email confirmation** depending on your Auth settings. Users see **CHECK YOUR EMAIL** until they confirm, then they can sign in.

Password reset uses **Forgot password?** and `resetPasswordForEmail` with redirect to `/login`.

## 6. Dependency

Auth uses a **small built-in REST client** in `src/lib/supabaseClient.js` (no `@supabase/supabase-js` package). You can still add the official SDK later if you want database/realtime helpers:

```bash
npm install @supabase/supabase-js
```

Then switch `supabaseClient.js` to use `createClient` from that package if you prefer.

## 7. Using auth in components

```jsx
import { useAuth } from '../context/AuthContext.jsx';

const { user, session, loading, signOut, configured } = useAuth();
```

`configured` is `false` when Supabase env vars are missing (forms stay disabled with an on-screen notice).
