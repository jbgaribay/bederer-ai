# Bederer AI

An AI tennis coach. Upload a short clip of your swing and get frame-by-frame coaching feedback: scores for stance, backswing, contact, follow-through, and footwork, the reference frame behind each score, a top priority, and a drill.

Guests get one free analysis. Signed-in users get unlimited scans, a saved swing history with a progress chart, and a profile (name, username, UTR, USTA level).

## Stack

- **Next.js 16** (App Router), React, Tailwind CSS
- **Supabase** for auth (email and password) and Postgres (`profiles`, `swings`)
- **Claude API** (`@anthropic-ai/sdk`) to analyze the frames, with structured JSON output
- Frames are pulled **in the browser** (`lib/extract-frames.ts`): 6 evenly spaced frames, up to 960px wide, so only about 300 KB is uploaded per scan instead of the whole video

## Getting started

### Prerequisites

- Node.js 22+
- A Supabase project and an Anthropic API key

### Environment variables

Create `.env.local` in the project root:

| Variable | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key, used server-side only |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key |
| `NEXT_PUBLIC_SITE_URL` | Optional. The public site URL, used for link-preview images. Falls back to Vercel's production URL, then `http://localhost:3000`. |

### Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Database

Migrations live in `supabase/migrations/`:

- `create_swings`: the swing history table, with RLS so users only see their own swings
- `tighten_swings_grants`: removes the default anon/authenticated grants
- `create_profiles`: player profiles, the sign-up trigger that creates them, and the `username_available` check
- `swing_frames`: a private `swing-frames` Storage bucket for each signed-in swing's 6 reference frames (`{user_id}/{swing_id}/frame-N.jpg`, readable only by that user), plus `swings.frame_paths`

In Supabase Auth, add `http://localhost:3000/auth/callback` (and your production `/auth/callback` URL) to the redirect URLs so email confirmation links work.

### Admin accounts

Admin is stored in `app_metadata`, which users can't change. To make an account an admin, run this in the Supabase SQL editor, then sign out and back in:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'you@example.com';
```

## Deploying (Vercel)

1. Import the GitHub repo in Vercel and set the **production branch** to `develop`.
2. Add the environment variables above. Set `NEXT_PUBLIC_SITE_URL` to the live URL, e.g. `https://bederer.ai`.
3. In Supabase → Authentication → URL Configuration, set the **Site URL** to the live URL and add `https://<your-domain>/auth/callback` to the redirect URLs.

Uploads stay small (browser-extracted frames), so Vercel's 4.5 MB request limit isn't an issue. The analyze route allows up to 60 seconds.

## Branches

- `dev`: day-to-day work
- `develop`: production. Merge `dev` into `develop` to release.
