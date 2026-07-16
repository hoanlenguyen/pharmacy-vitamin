# Deployment — Nuxt on Vercel + Cloudflare Worker (D1 & R2)

The frontend (Nuxt) runs on **Vercel**; the API (Cloudflare Worker) runs on **Cloudflare**
because Cloudflare D1 (database) and R2 (blob storage) bindings only work inside the Workers
runtime. Vercel can't bind to them directly, so the Worker stays on Cloudflare and Nuxt's
`server/api/*` routes proxy to it over HTTPS — the pattern the app already uses
(`server/utils/workerApi.ts`).

```
Browser ──► Nuxt on Vercel (SSR + /api/* proxies) ──► Cloudflare Worker ──► D1 (database)
        └─► <img> product images ───────────────────────────────────────└─► R2 (image blobs)
```

Image blobs are served *through* the Worker (`GET /images/*`), and product image URLs are
stored as absolute Worker URLs — so images load straight from the Worker origin regardless of
where the frontend is hosted.

---

## 1. Cloudflare Worker (API + D1 + R2)

All commands run from the repo root.

```bash
# 1. Create the database, then paste the printed database_id into wrangler.toml
wrangler d1 create pharmacy-vitamin-db

# 2. Create the image bucket (binding in wrangler.toml already points at this name)
wrangler r2 bucket create pharmacy-vitamin-images

# 3. Apply migrations to the real (remote) database
npm run db:migrate:remote
# optional: seed demo data
npm run db:seed:remote

# 4. Set the API bearer token as a secret (choose a long random value)
wrangler secret put API_TOKEN

# 5. Deploy — note the printed URL, e.g.
#    https://pharmacy-vitamin-api.<your-subdomain>.workers.dev
wrangler deploy
```

Before step 5, `wrangler.toml` must have the real `database_id` from step 1 (it currently holds
a `REPLACE_WITH_REAL_DATABASE_ID` placeholder).

## 2. Nuxt on Vercel

1. Import the repo into Vercel. Framework preset: **Nuxt**; build command `nuxt build` (it only
   builds the Nuxt app — `worker/`, `wrangler.toml`, and `db/` are excluded via `.vercelignore`).
2. Set **Environment Variables** (Project → Settings → Environment Variables):

   | Variable            | Value                                                        |
   | ------------------- | ------------------------------------------------------------ |
   | `WORKER_API_URL`    | the Worker URL from step 1.5 (`https://…workers.dev`)        |
   | `WORKER_API_TOKEN`  | **the same value** as the Worker's `API_TOKEN` secret        |
   | `ADMIN_UI_TOKEN`    | token that gates the `/admin` UI                             |

3. Deploy.

## 3. Verify

- Open the Vercel URL — the storefront should load products (proves Nuxt → Worker → D1).
- Product images render (proves R2 via the Worker).
- Log into `/admin` with `ADMIN_UI_TOKEN` and load a list page (proves the authenticated proxy).

---

## Notes

- **Token parity is mandatory:** `WORKER_API_TOKEN` (Vercel) must equal `API_TOKEN` (Worker
  secret) or every proxied call returns 401.
- **No CORS setup needed:** API traffic is server-to-server (Nuxt → Worker); images load via
  `<img>` (not browser `fetch`), so nothing hits the Worker cross-origin from browser JS.
- **`*.workers.dev` URL:** image URLs for uploads made after go-live embed this hostname. If you
  later move the Worker to a custom domain, update `WORKER_API_URL` and re-point existing image
  URLs. Using a custom domain from the start avoids that.
- **Redeploying the API** is independent of Vercel: `wrangler deploy` for the Worker,
  `git push` (or Vercel redeploy) for the frontend.
