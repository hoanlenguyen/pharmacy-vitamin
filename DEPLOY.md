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

## Provisioned resources (current)

| Resource            | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| Worker URL          | `https://pharmacy-vitamin-api.lenguyenhanhoan.workers.dev`   |
| Cloudflare account  | `45d26c85e451d2348d3355ad6f0e96e0`                           |
| D1 database         | `pharmacy-vitamin-db` (`275397aa-d943-4f3b-bc65-f403ff3e6756`) — migrated + seeded |
| R2 bucket           | `pharmacy-vitamin-images`                                    |
| `API_TOKEN` secret  | set on the Worker (rotate if it has been shared)             |

The Cloudflare side is already deployed; Section 1 is the reproduction/rebuild recipe.

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

Before step 5, `wrangler.toml` must have the real `database_id` from step 1 (already filled in
for the current deployment).

## 2. Nuxt on Vercel

1. Import the repo into Vercel. Framework preset: **Nuxt**; build command `nuxt build` (it only
   builds the Nuxt app — `worker/`, `wrangler.toml`, and `db/` are excluded via `.vercelignore`).
2. Set **Environment Variables** (Project → Settings → Environment Variables):

   | Variable            | Value                                                        |
   | ------------------- | ------------------------------------------------------------ |
   | `WORKER_API_URL`    | `https://pharmacy-vitamin-api.lenguyenhanhoan.workers.dev`   |
   | `WORKER_API_TOKEN`  | **the same value** as the Worker's `API_TOKEN` secret        |
   | `ADMIN_UI_TOKEN`    | token that gates the `/admin` UI                             |

3. Deploy. Env vars only apply to **new** builds — redeploy after adding them.

## 3. CI — auto-deploy the Worker (GitHub Actions)

`.github/workflows/deploy-worker.yml` runs D1 migrations + `wrangler deploy` on pushes to the
`deploy` branch that touch `worker/**`, `db/migrations/**`, or `wrangler.toml` (and via manual
`workflow_dispatch`). Add two **repository secrets** (Settings → Secrets and variables → Actions):

| Secret                  | Value                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | `45d26c85e451d2348d3355ad6f0e96e0`                                 |
| `CLOUDFLARE_API_TOKEN`  | a Cloudflare API token (see permissions below)                    |

Create the API token at **My Profile → API Tokens → Create Token** (start from the *Edit
Cloudflare Workers* template, then add D1). Required **account-scoped** permissions:

- **Workers Scripts: Edit** — deploy the Worker
- **D1: Edit** — apply migrations
- **Workers R2 Storage: Read** — validate the R2 binding at deploy time
- **Account Settings: Read**

This is a *Cloudflare API token* for tooling — **not** an R2 API Token (S3 access key). R2 API
Tokens are only needed to reach the bucket from outside the Workers runtime (`aws s3`, `rclone`,
a non-Worker service); this app never does — it uses the `env.IMAGES` binding, which needs no
keys. The Worker's own `API_TOKEN` bearer secret is set once via `wrangler secret put` and is
**not** managed by CI (deploying code doesn't clear existing secrets).

## 4. Verify

- Open the Vercel URL — the storefront should load products (proves Nuxt → Worker → D1).
- Product images render (proves R2 via the Worker; seed data uses placeholder URLs, so upload a
  real image via `/admin` to confirm end to end).
- Log into `/admin` with `ADMIN_UI_TOKEN` and load a list page (proves the authenticated proxy).

Quick Worker smoke test (no browser needed):

```bash
curl -s "https://pharmacy-vitamin-api.lenguyenhanhoan.workers.dev/products?limit=1"   # 200 + JSON
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://pharmacy-vitamin-api.lenguyenhanhoan.workers.dev/admin/products"           # 401 (auth enforced)
```

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
