#!/usr/bin/env node
// Smoke test for export-payments.js using a local mock HTTP server
const http = require('http')
const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

const PORT = 4002
const API_URL = `http://localhost:${PORT}`
const OUT_DIR = path.join(process.cwd(), 'exports')
const DATE = new Date().toISOString().slice(0,10)

const sampleOrders = [
  { orderId: 'ord_1', totalAmount: 100000, status: 'paid', createdAt: new Date() },
  { orderId: 'ord_2', totalAmount: 50000, status: 'pending', createdAt: new Date() }
]

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/admin/orders')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(sampleOrders))
    return
  }
  res.writeHead(404)
  res.end('not found')
})

server.listen(PORT, async () => {
  console.log('Mock API server listening on', PORT)
  // Run export-payments.js pointing to this mock
  const cmd = `API_URL=${API_URL} node scripts/export-payments.js --date=${DATE}`
  exec(cmd, (err, stdout, stderr) => {
    server.close()
    if (err) {
      console.error('Export script failed:', stderr || err.message)
      process.exit(1)
    }
    const outPath = path.join(OUT_DIR, `payments-${DATE}.csv`)
    if (!fs.existsSync(outPath)) {
      console.error('Expected output file missing:', outPath)
      process.exit(1)
    }
    const content = fs.readFileSync(outPath, 'utf8')
    if (!content.includes('orderId') || !content.includes('ord_1')) {
      console.error('CSV content looks incorrect')
      process.exit(1)
    }
    console.log('Test passed — export created:', outPath)
    process.exit(0)
  })
})
