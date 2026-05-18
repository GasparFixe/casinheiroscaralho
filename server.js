const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 8080
const DATA_DIR = path.join(__dirname, 'data')

function dataPath(name) { return path.join(DATA_DIR, name + '.json') }
function readJSON(name, fallback) {
  try { return JSON.parse(fs.readFileSync(dataPath(name), 'utf8')) }
  catch { return fallback }
}
function writeJSON(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(dataPath(name), JSON.stringify(data, null, 2))
}

app.use(cors())
app.use(express.json())

const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

app.get('/api/guestbook', (req, res) => res.json(readJSON('guestbook', { entries: [] })))
app.post('/api/guestbook', (req, res) => {
  const { id, name, from, note, when } = req.body
  if (!name?.trim() || !note?.trim()) return res.status(400).json({ error: 'name and note required' })
  const data = readJSON('guestbook', { entries: [] })
  data.entries.unshift({ id: id || ('gb-' + Date.now()), name: name.trim().slice(0,60), from: (from||'—').trim().slice(0,60), note: note.trim().slice(0,500), when: when || Date.now() })
  writeJSON('guestbook', data)
  res.json(data)
})
app.get('/api/rsvps', (req, res) => res.json(readJSON('rsvps', { totals: {} })))
app.post('/api/rsvps/:id', (req, res) => {
  const data = readJSON('rsvps', { totals: {} })
  data.totals[req.params.id] = (data.totals[req.params.id] || 0) + 1
  writeJSON('rsvps', data); res.json(data)
})
app.delete('/api/rsvps/:id', (req, res) => {
  const data = readJSON('rsvps', { totals: {} })
  data.totals[req.params.id] = Math.max(0, (data.totals[req.params.id] || 0) - 1)
  writeJSON('rsvps', data); res.json(data)
})

if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => console.log(`✶ Casinheiros on port ${PORT} | dist: ${fs.existsSync(distPath)}`))
