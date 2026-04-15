const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const DATA_DIR = path.join(__dirname, 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DEFAULT_SETTINGS = {
  apiKey: '',
  model: '',
  endpoint: 'https://api.openai.com/v1/chat/completions',
}

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) } }
  catch { return DEFAULT_SETTINGS }
}
function saveSettings(s) { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2)) }

// Settings API
app.get('/api/settings', (_, res) => {
  const s = loadSettings()
  res.json({ ...s, apiKey: s.apiKey ? '****' + s.apiKey.slice(-8) : '' })
})

app.post('/api/settings', (req, res) => {
  const current = loadSettings()
  const next = { ...current, ...req.body }
  if (req.body.apiKey && !req.body.apiKey.startsWith('****')) {
    next.apiKey = req.body.apiKey
  } else {
    next.apiKey = current.apiKey
  }
  saveSettings(next)
  res.json({ ok: true })
})

// Fetch available models
app.get('/api/models', async (_, res) => {
  const settings = loadSettings()
  if (!settings.apiKey) return res.json({ models: [] })
  const endpoint = (settings.endpoint || DEFAULT_SETTINGS.endpoint).replace(/\/chat\/completions$/, '/models')
  try {
    const resp = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${settings.apiKey}` },
    })
    const data = await resp.json()
    const models = (data.data || []).map(m => m.id).filter(Boolean)
    res.json({ models })
  } catch (e) {
    res.json({ models: [], error: e.message })
  }
})

// LLM Chat proxy (OpenAI-compatible)
app.post('/api/chat', async (req, res) => {
  const settings = loadSettings()
  if (!settings.apiKey) return res.status(400).json({ error: '请先在设置中配置 API Key' })

  const { messages } = req.body
  const url = settings.endpoint || DEFAULT_SETTINGS.endpoint
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` }
  const body = JSON.stringify({
    model: settings.model || 'gpt-4o-mini',
    messages,
    temperature: 0.3,
    max_tokens: 4096,
  })

  try {
    const resp = await fetch(url, { method: 'POST', headers, body })
    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json({ error: data.error?.message || JSON.stringify(data) })
    const content = data.choices?.[0]?.message?.content || ''
    res.json({ content })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')))
app.get('/{*path}', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

const PORT = process.env.PORT || 4173
app.listen(PORT, () => {
  console.log(`\n  周报助手 v5.2`)
  console.log(`  http://localhost:${PORT}\n`)
})
