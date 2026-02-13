#!/usr/bin/env node
// Activate campaign immediately (set isActive = true in MongoDB)
const MongoClient = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set')
  process.exit(1)
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.MONGO_DB || 'agri')
  const campaigns = db.collection('campaigns')

  // Activate campaign "engrais-mars-2026"
  const result = await campaigns.updateOne(
    { slug: 'engrais-mars-2026' },
    { $set: { isActive: true } }
  )

  if (result.modifiedCount > 0) {
    console.log('✅ Campaign ACTIVATED: engrais-mars-2026')
    const campaign = await campaigns.findOne({ slug: 'engrais-mars-2026' })
    console.log('Campaign status:', JSON.stringify({ isActive: campaign.isActive, name: campaign.name }, null, 2))
  } else {
    console.log('⚠️ Campaign not found or already active')
  }

  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })
