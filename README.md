# Casinheiros

Acid jazz from Ovar. A band website with a real backend.

## Stack

- **Backend** — Node.js + Express
- **Database** — SQLite via `better-sqlite3` (single file, zero config)
- **Frontend** — React (CDN) + Web Audio API (synth engine)

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

The SQLite database file (`casinheiros.db`) is created automatically on first run.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/guestbook` | All guestbook entries (newest first) |
| POST | `/api/guestbook` | Add a new entry |
| GET | `/api/rsvps` | RSVP totals per session |
| POST | `/api/rsvps/:sessionId` | Increment/decrement RSVP count |

## Deploy to Railway (recommended)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects Node.js and runs `npm start`
4. Done — your site is live

**Note:** SQLite data persists on Railway's persistent disk. For multi-instance deploys, switch to Postgres using the `pg` package and Railway's Postgres plugin.

## Deploy to Render

1. Push to GitHub
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `DB_PATH` | `./casinheiros.db` | SQLite file path |

## Project structure

```
casinheiros/
├── server.js          ← Express backend + SQLite
├── package.json
├── casinheiros.db     ← created on first run (git-ignored)
└── public/
    └── index.html     ← entire frontend (self-contained)
```
