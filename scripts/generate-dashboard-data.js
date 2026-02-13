#!/usr/bin/env node
// Generate simple JSON aggregates for dashboard (requires MONGODB_URI)
const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set. Exiting.')
  process.exit(1)
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.MONGO_DB || 'agri')
  const orders = db.collection('orders')

  const since24h = new Date(Date.now() - 24*3600*1000)
  const orders24 = await orders.aggregate([
    { $match: { createdAt: { $gte: since24h } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }
  ]).toArray()

  const pending = await orders.countDocuments({ "installmentPayment.remaining": { $gt: 0 } })

  const out = {
    timestamp: new Date(),
    last24h: orders24[0] || { count:0, revenue:0 },
    pendingPayments: pending
  }

  const outDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const file = path.join(outDir, `dashboard-${Date.now()}.json`)
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.log('Wrote', file)
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })
