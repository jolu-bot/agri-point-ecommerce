#!/usr/bin/env node
// Export payments/orders for a given date into CSV
const fs = require('fs')
const path = require('path')
const fetch = global.fetch || require('node-fetch')

const argv = require('minimist')(process.argv.slice(2))
const date = argv.date || argv.d || new Date().toISOString().slice(0,10)
const API_URL = process.env.API_URL || 'http://localhost:3000'
const OUT_DIR = path.join(process.cwd(), 'exports')

async function fetchOrders(sinceDate) {
  const url = `${API_URL}/api/admin/orders?since=${sinceDate}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error('Failed to fetch orders: ' + res.status)
  return res.json()
}

function toCSV(rows) {
  if (!rows || rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const lines = [keys.join(',')]
  for (const r of rows) {
    lines.push(keys.map(k => '"'+String(r[k] ?? '') .replace(/"/g,'""')+'"').join(','))
  }
  return lines.join('\n')
}

async function main() {
  try {
    console.log(`[export-payments] Fetching orders since ${date} from ${API_URL}`)
    const data = await fetchOrders(date)
    console.log(`[export-payments] Retrieved ${Array.isArray(data) ? data.length : 0} orders`)
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
    const outPath = path.join(OUT_DIR, `payments-${date}.csv`)
    const csv = toCSV(data)
    fs.writeFileSync(outPath, csv)
    console.log('[export-payments] Wrote', outPath)
    if (process.env.VERBOSE) {
      console.log('[export-payments] Sample row:', data && data[0] ? JSON.stringify(data[0]) : 'empty')
    }
  } catch (err) {
    console.error('[export-payments] Error:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

if (require.main === module) main()
