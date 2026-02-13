#!/usr/bin/env node
// Push a minimal dashboard JSON to Grafana via HTTP API (requires API key)
const fs = require('fs')
const fetch = global.fetch || require('node-fetch')
const path = require('path')

const GRAFANA_URL = process.env.GRAFANA_URL
const GRAFANA_KEY = process.env.GRAFANA_API_KEY
if (!GRAFANA_URL || !GRAFANA_KEY) {
  console.error('Set GRAFANA_URL and GRAFANA_API_KEY')
  process.exit(1)
}

const tplPath = path.join(process.cwd(), 'grafana', 'dashboard-template.json')
if (!fs.existsSync(tplPath)) {
  console.error('Missing dashboard template:', tplPath)
  process.exit(1)
}

const dashboard = JSON.parse(fs.readFileSync(tplPath, 'utf8'))
const payload = { dashboard, overwrite: true }

async function main() {
  console.log('[grafana] Pushing dashboard to', GRAFANA_URL)
  const res = await fetch(`${GRAFANA_URL}/api/dashboards/db`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GRAFANA_KEY}` },
    body: JSON.stringify(payload)
  })
  const text = await res.text()
  if (!res.ok) {
    console.error('[grafana] API failed:', res.status, text)
    process.exit(1)
  }
  if (process.env.VERBOSE) console.log('[grafana] response:', text)
  console.log('[grafana] Dashboard pushed successfully')
}

main().catch(err => { console.error('[grafana]', err); process.exit(1) })
