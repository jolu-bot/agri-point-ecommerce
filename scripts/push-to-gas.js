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
  const res = await fetch(GAS_URL, { method: 'POST', body: csv, headers: { 'Content-Type': 'text/csv' } })
  if (!res.ok) {
    console.error('Failed to push to GAS:', res.status, await res.text())
    process.exit(1)
  }
  console.log('Pushed', file, 'to GAS')
}

main().catch(err => { console.error(err); process.exit(1) })
