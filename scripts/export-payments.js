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
    const data = await fetchOrders(date)
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
    const outPath = path.join(OUT_DIR, `payments-${date}.csv`)
    const csv = toCSV(data)
    fs.writeFileSync(outPath, csv)
    console.log('Wrote', outPath)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

if (require.main === module) main()
