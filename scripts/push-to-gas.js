#!/usr/bin/env node
// Push a CSV file to a Google Apps Script webhook which appends rows to a Sheet.
// Usage: GAS_URL="https://script.google.com/.../exec" node scripts/push-to-gas.js exports/payments-2026-03-01.csv
const fs = require('fs')
const fetch = global.fetch || require('node-fetch')

const GAS_URL = process.env.GAS_URL
if (!GAS_URL) {
  console.error('GAS_URL not set. Set it to your Google Apps Script deploy URL.')
  process.exit(1)
}

const file = process.argv[2]
if (!file || !fs.existsSync(file)) {
  console.error('Usage: GAS_URL=... node scripts/push-to-gas.js <csv-file>')
  process.exit(1)
}

const csv = fs.readFileSync(file, 'utf8')

async function main() {
  const MAX_RETRIES = 3
  for (let attempt=1; attempt<=MAX_RETRIES; attempt++) {
    if (process.env.VERBOSE) console.log(`[push-to-gas] POST attempt ${attempt} -> ${GAS_URL}`)
    const res = await fetch(GAS_URL, { method: 'POST', body: csv, headers: { 'Content-Type': 'text/csv' } })
    const text = await res.text().catch(()=> '')
    if (res.ok) {
      console.log('[push-to-gas] Pushed', file, 'to GAS')
      if (process.env.VERBOSE) console.log('[push-to-gas] response:', text)
      process.exit(0)
    }
    console.error('[push-to-gas] attempt', attempt, 'failed:', res.status, text)
    if (attempt < MAX_RETRIES) await new Promise(r=>setTimeout(r, 1000*attempt))
  }
  console.error('[push-to-gas] all attempts failed')
  process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
