# Crusher customer portal

Standalone web app for **customer self-service** (trips, outstanding, payments).  
Uses **portal JWT** from `POST /portal/login` — not the ERP staff token.

## API (OpenAPI)

| Method | Path | Auth |
|--------|------|------|
| POST | `/portal/login` | None — `{ email, password }` (or `code`) |
| POST | `/portal/refresh` | `{ refreshToken }` |
| POST | `/portal/change-password` | Bearer — `{ currentPassword, newPassword }` |
| GET | `/portal/me` | Profile |
| GET | `/portal/dashboard` | Landing summary |
| GET | `/portal/credit-status` | Credit block status |
| GET | `/portal/outstanding` | Balance + FIFO aging |
| GET | `/portal/ledger` | Ledger (`dateFrom`, `dateTo`) |
| GET | `/portal/dispatches` | Trip list |
| GET | `/portal/dispatches/{id}` | Trip detail |
| GET | `/portal/invoices` | Invoice list |
| GET | `/portal/invoices/{id}` | Invoice detail |

Staff enable access in the main ERP app: **Masters → Customer → Portal** (`PATCH /customers/{id}/portal-access`).

## Local development

```bash
cd E:\RSN\crusher_customer_portal
npm install
npm run dev
```

- App: http://localhost:5173  
- API: Vite proxies `/api` → backend (see `VITE_API_PROXY_TARGET` in `.env.example`).

## Production build

```bash
npm run build
npm run preview
```

Production uses **`.env.production`**: `VITE_API_BASE_URL=/api/v1` (same host as the portal; proxy `/api` to the ERP backend — see `vercel.json`, same pattern as `crusher_frontend`).

## Hosting (separate from ERP)

This repo is meant for its **own** origin (e.g. `portal.yourdomain.com`).

1. `npm run build` (loads `.env.production` with `/api/v1` unless overridden).
2. Deploy `dist/` to static hosting (Vercel, Netlify, S3+CloudFront, nginx, etc.).
3. SPA fallback: all routes → `index.html` (see `vercel.json`).
4. **CORS**: backend must allow this origin on `/portal/*` (and preflight for `Authorization` header).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Full API base in production (required unless you reverse-proxy `/api/v1` on the same host) |
| `VITE_API_PROXY_TARGET` | Dev-only proxy target (default live server in vite.config) |
| `VITE_PORTAL_OPERATOR_NAME` | Operator prefix (default `SuperCrusher`); title is `{name} Customer Portal` |

## Repo layout

- `src/api/` — portal session + HTTP client (portal token only)
- `src/pages/` — login + dashboard
- No ERP routes, masters, or staff auth

## Related project

ERP frontend: `E:\RSN\crusher_frontend` (customer portal **access** is configured there; customers **use** this app).
