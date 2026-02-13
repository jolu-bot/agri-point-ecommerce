#!/usr/bin/env node
// Simple monitoring agent: ping health endpoint and log summary
const fs = require('fs')
const { URL } = require('url')

const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:3000/api/health'
const LOG_FILE = process.env.MONITOR_LOG || 'logs/monitoring.log'
const INTERVAL = parseInt(process.env.MONITOR_INTERVAL || '300') * 1000 // default 5min

async function ping(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    return { ok: res.ok, status: res.status, text: await res.text().catch(()=> '') }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

function logLine(obj) {
  const line = `[${new Date().toISOString()}] ${JSON.stringify(obj)}\n`
  try {
    fs.mkdirSync('logs', { recursive: true })
    fs.appendFileSync(LOG_FILE, line)
  } catch (e) {
    console.error('Failed to write log', e.message)
  }
}

async function runOnce() {
  console.log('[monitoring-agent] Pinging', HEALTH_URL)
  const result = await ping(HEALTH_URL)
  const out = { url: HEALTH_URL, result }
  if (process.env.VERBOSE) {
    console.log('[monitoring-agent] Result:', JSON.stringify(out, null, 2))
  } else {
    console.log('[monitoring-agent] status=', result.status || 'ERR', 'ok=', !!result.ok)
  }
  if (result && result.error) console.error('[monitoring-agent] error:', result.error)
  logLine(out)
}

if (require.main === module) {
  // run once immediately, then interval
  runOnce()
  setInterval(runOnce, INTERVAL)
}

module.exports = { runOnce }
