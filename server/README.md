# écoute server

Express 5 + TypeScript REST API for écoute. It builds the recommendation prompt, sends it to **sift** (an authenticated GraphQL gateway to Claude), and persists rounds and recommendations in SQLite.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `POST` | `/recommend` | Get five song recommendations for a theme |
| `GET` | `/recommend/history` | Past rounds and their recommendations |
| `PATCH` | `/recommend/:id/score` | Save a score for a recommendation |

CORS allows `http://localhost:5173` and `https://ecoute-five.vercel.app` (see `src/index.ts`).

## Environment variables

Set these in `server/.env` locally (loaded via `dotenv`) or in your host's environment settings when deployed.

| Variable | Required | Description |
| --- | --- | --- |
| `SIFT_URL` | Yes | Full URL of sift's GraphQL endpoint. Recommendation requests are POSTed here. |
| `AUTH0_DOMAIN` | Yes | Auth0 tenant domain, e.g. `your-tenant.us.auth0.com` (no `https://`). |
| `AUTH0_CLIENT_ID` | Yes | Client ID of the Auth0 machine-to-machine (M2M) application. |
| `AUTH0_CLIENT_SECRET` | Yes | Client secret of the M2M application. Keep it secret. |
| `AUTH0_AUDIENCE` | Yes | Identifier (audience) of the Auth0 API that sift validates tokens against. |
| `PORT` | No | Port to listen on. Defaults to `3000`. Hosts like Render set this automatically. |

> `.env.example` currently lists only `ANTHROPIC_API_KEY`, but the server code no longer reads it — Claude is reached through sift, which holds the Anthropic credentials.

## How the server authenticates to sift

The server uses the OAuth 2.0 **client credentials** flow with an Auth0 M2M application (`src/services/claude.ts`):

1. On each recommendation request, the server POSTs to `https://$AUTH0_DOMAIN/oauth/token` with `client_id`, `client_secret`, `audience`, and `grant_type: client_credentials`.
2. Auth0 returns an `access_token` (a JWT for the configured audience).
3. The server POSTs a GraphQL `sendMessage` mutation to `SIFT_URL` with the header `Authorization: Bearer <access_token>`, using the `claude-haiku-4-5-20251001` model.
4. sift validates the token and returns the model's reply, which the server parses into the five recommendations. GraphQL `errors` in the response are thrown as errors.

Tokens are fetched per request and are not cached.

The M2M application must be authorized for the API identified by `AUTH0_AUDIENCE` in the Auth0 dashboard, or token requests will be rejected.

## Local development

```bash
npm install
npm run dev     # ts-node src/index.ts, http://localhost:3000
```

Or run both client and server from the repo root with `npm run dev`.

| Script | Description |
| --- | --- |
| `npm run dev` | Run with `ts-node` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/index.js`) |

## Deployment (Render)

The server is deployed as a Render Web Service.

- **Root directory:** `server`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment:** add `SIFT_URL` and the four `AUTH0_*` variables in the Render dashboard. Don't set `PORT` — Render provides it and the server reads `process.env.PORT`.
- **CORS:** the deployed client origin must be in the allowlist in `src/index.ts` (currently `https://ecoute-five.vercel.app`).
- **Health check:** point Render's health check path at `/health`.
- **Persistence:** history is stored in a SQLite file (`ecoute.db`). On Render's default ephemeral filesystem this file is lost on each deploy or restart; attach a persistent disk if you need history to survive.
