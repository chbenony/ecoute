# 🎧 écoute

**écoute** is a song recommendation assistant built for [Music League](https://musicleague.com/) players. Give it a round's theme — plus, optionally, some league context and a strategy vibe — and it asks Claude to suggest five songs to submit, complete with reasoning for each pick. Every round you run is logged, so you can look back at what you submitted, why, and how it scored against the rest of the league.

## ✨ Features

- 🎯 **Themed recommendations** — describe a round's theme and get five tailored song picks with rationale for each
- 🧠 **Context-aware** — feed in league context and a desired "vibe" or strategy to steer Claude's picks
- 📜 **Round history** — past rounds and their recommendations are persisted so you can revisit them later
- ⚡ **Simple full-stack setup** — one command spins up both the client and server for local development

## 🛠️ Stack

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white" />
  <img alt="Anthropic Claude" src="https://img.shields.io/badge/Claude-Anthropic%20API-D97757?logo=anthropic&logoColor=white" />
</p>

- 💻 **Client** — React 19 + Vite + TypeScript single-page app
- 🚀 **Server** — Express 5 + TypeScript REST API that talks to the Anthropic API (`@anthropic-ai/sdk`, `claude-haiku-4-5`) to generate recommendations
- 🗄️ **Storage** — SQLite via `better-sqlite3` for lightweight, file-based persistence of rounds and recommendations

## 📁 Project structure

```
ecoute/
├── client/   # React/Vite frontend
└── server/   # Express API + SQLite persistence
```

| File | Purpose |
| --- | --- |
| `server/src/routes/recommend.ts` | `POST /recommend` (get suggestions), `GET /recommend/history` (past rounds) |
| `server/src/services/claude.ts` | Builds the prompt and calls the Anthropic API |
| `server/src/db/history.ts` | SQLite schema and queries (`rounds`, `recommendations` tables) |
| `client/src/App.tsx` | The single-page UI (recommend tab + history tab) |

## 🚀 Setup

1. **Install dependencies** (root, client, and server each have their own `package.json`):

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. **Add your Anthropic API key** to `server/.env`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Run both apps together** from the repo root:

   ```bash
   npm run dev
   ```

   This starts the server on [http://localhost:3000](http://localhost:3000) 🖥️ and the client on [http://localhost:5173](http://localhost:5173) 🌐.

## ⚠️ Known gaps

- The UI's "save score" action calls `PATCH /recommend/:id/score`, but that endpoint isn't implemented on the server yet — scores won't persist until it's added.
