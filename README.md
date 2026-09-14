# écoute

A song recommendation assistant for [Music League](https://musicleague.com/) rounds. Give it a theme (and optionally some league context and a strategy vibe), and Claude suggests five songs to submit — with reasoning for each pick. Past rounds are logged so you can track what you submitted and how it scored.

## Stack

- **Client** — React 19 + Vite + TypeScript
- **Server** — Express 5 + TypeScript, talking to the Anthropic API (`@anthropic-ai/sdk`, `claude-haiku-4-5`)
- **Storage** — SQLite via `better-sqlite3`

## Project structure

```
ecoute/
├── client/   # React/Vite frontend
└── server/   # Express API + SQLite persistence
```

- `server/src/routes/recommend.ts` — `POST /recommend` (get suggestions), `GET /recommend/history` (past rounds)
- `server/src/services/claude.ts` — builds the prompt and calls the Anthropic API
- `server/src/db/history.ts` — SQLite schema and queries (`rounds`, `recommendations` tables)
- `client/src/App.tsx` — the single-page UI (recommend tab + history tab)

## Setup

1. Install dependencies (root, client, and server each have their own `package.json`):

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. Add your Anthropic API key to `server/.env`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Run both apps together from the repo root:

   ```bash
   npm run dev
   ```

   This starts the server on [http://localhost:3000](http://localhost:3000) and the client on [http://localhost:5173](http://localhost:5173).

## Known gaps

- The UI's "save score" action calls `PATCH /recommend/:id/score`, but that endpoint isn't implemented on the server yet — scores won't persist until it's added.
