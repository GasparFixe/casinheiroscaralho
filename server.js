// Casinheiros — Express backend
// Stores guestbook entries and RSVP counts in JSON files under ./data/
// 
// Endpoints:
//   GET  /api/guestbook          → { entries: [...] }
//   POST /api/guestbook          → { entries: [...] }  (body: entry object)
//   GET  /api/rsvps              → { totals: { sessionId: count } }
//   POST /api/rsvps/:sessionId   → increment RSVP
//   DELETE /api/rsvps/:sessionId → decrement RSVP

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = path.join(__dirname, 'data')

// ── helpers ──────────────────────────────────────────
function dataPath(name) { return path.join(DATA_DIR, name + '.json') }

function readJSON(name, fallback) {
  try {
    const raw = fs.readFileSync(dataPath(name), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJSON(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(dataPath(name), JSON.stringify(data, null, 2))
}

// ── middleware ────────────────────────────────────────
app.use(cors())
app.use(express.json())

// Serve the built frontend in production
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// ── guestbook ─────────────────────────────────────────
app.get('/api/guestbook', (req, res) => {
  const data = readJSON('guestbook', { entries: [] })
  res.json(data)
})

app.post('/api/guestbook', (req, res) => {
  const { id, name, from, note, when } = req.body

  // basic validation
  if (!name?.trim() || !note?.trim()) {
    return res.status(400).json({ error: 'name and note are required' })
  }

  const data = readJSON('guestbook', { entries: [] })
  const entry = {
    id: id || ('gb-' + Date.now()),
    name: name.trim().slice(0, 60),
    from: (from || '—').trim().slice(0, 60),
    note: note.trim().slice(0, 500),
    when: when || Date.now(),
  }
  data.entries.unshift(entry)

  // keep last 500 entries
  if (data.entries.length > 500) data.entries = data.entries.slice(0, 500)

  writeJSON('guestbook', data)
  res.json(data)
})

// ── rsvps ─────────────────────────────────────────────
app.get('/api/rsvps', (req, res) => {
  const data = readJSON('rsvps', { totals: {} })
  res.json(data)
})

app.post('/api/rsvps/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const data = readJSON('rsvps', { totals: {} })
  data.totals[sessionId] = (data.totals[sessionId] || 0) + 1
  writeJSON('rsvps', data)
  res.json(data)
})

app.delete('/api/rsvps/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const data = readJSON('rsvps', { totals: {} })
  data.totals[sessionId] = Math.max(0, (data.totals[sessionId] || 0) - 1)
  writeJSON('rsvps', data)
  res.json(data)
})

// ── catch-all for SPA ─────────────────────────────────
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✶ Casinheiros backend running on http://localhost:${PORT}`)
  console.log(`  Data stored in: ${DATA_DIR}`)
})
