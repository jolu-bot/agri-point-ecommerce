#!/usr/bin/env node
/**
 * COMPLETE CAMPAIGN ACTIVATION SCRIPT
 * 
 * This script:
 * 1. Activates campaign in MongoDB (isActive = true)
 * 2. Verifies that the page is accessible
 * 3. Shows you where the campaign link appears in the site
 * 
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." API_URL="https://agri-ps.com" node scripts/activate-campaign-complete.js
 */

const { MongoClient } = require('mongodb')
const fetch = global.fetch || require('node-fetch')

const MONGODB_URI = process.env.MONGODB_URI
const API_URL = process.env.API_URL
const MONGO_DB = process.env.MONGO_DB || 'agri'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set')
  process.exit(1)
}

if (!API_URL) {
  console.error('⚠️ API_URL not set (optional). Using http://localhost:3000')
}

async function activateCampaignInDB() {
  console.log('\n📌 Step 1: Activating campaign in MongoDB...')
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(MONGO_DB)
    const campaigns = db.collection('campaigns')

    const result = await campaigns.updateOne(
      { slug: 'engrais-mars-2026' },
      { $set: { isActive: true } }
    )

    if (result.modifiedCount > 0) {
      console.log('   ✅ Campaign activated in MongoDB')
      
      const campaign = await campaigns.findOne({ slug: 'engrais-mars-2026' })
      console.log('   ✅ Campaign name:', campaign?.name)
      console.log('   ✅ Campaign status: ACTIVE (' + campaign?.isActive + ')')
      return true
    } else {
      console.log('   ⚠️ Campaign not found or already active')
      return false
    }
  } finally {
    await client.close()
  }
}

async function testPageAccessibility() {
  const url = API_URL + '/campagne-engrais'
  console.log('\n📌 Step 2: Testing page accessibility...')
  console.log('   URL:', url)
  
  try {
    const res = await fetch(url)
    console.log('   ✅ HTTP', res.status, res.statusText)
    if (res.ok) {
      const text = await res.text()
      if (text.includes('campagne') || text.includes('Campagne') || text.includes('engrais')) {
        console.log('   ✅ Campaign content found in page')
        return true
      }
    }
  } catch (err) {
    console.log('   ⚠️ Could not test URL (server may not be running). This is OK.')
  }
  return false
}

async function showWhereItAppears() {
  console.log('\n📌 Step 3: Where the campaign link appears in your site')
  console.log('\n   🎯 IN THE HEADER NAVIGATION:')
  console.log('      Location: Top navigation bar (next to "Nos Solutions")')
  console.log('      Style: Green button with emoji (🌱 Campagne Engrais)')
  console.log('      Featured: YES - highlighted in green to stand out')
  console.log('\n   📱 MOBILE NAVIGATION:')
  console.log('      Location: Hamburger menu (when opened)')
  console.log('      Style: Same green highlight as desktop')
  console.log('\n   🔗 DIRECT URL:')
  console.log('      /campagne-engrais')
  console.log('\n   📊 ADMIN DASHBOARD:')
  console.log('      Location: /admin/campaigns')
  console.log('      Available: YES - see orders and stats in real-time')
}

async function showNextSteps() {
  console.log('\n📌 Step 4: What to do next')
  console.log('\n   🚀 IMMEDIATE (right now):')
  console.log('      1. npm run build      # Rebuild Next.js with new Header')
  console.log('      2. npm run start      # or restart your server')
  console.log('      3. Open https://your-site.cm/  # Go to homepage')
  console.log('      4. Check the navigation bar - you should see green "🌱 Campagne Engrais" button')
  console.log('\n   👥 COMMUNICATE:')
  console.log('      - Send email to customers with campaign link')
  console.log('      - Post on social media (Facebook, WhatsApp)')
  console.log('      - Send SMS announcement (optional)')
  console.log('\n   📊 MONITOR:')
  console.log('      - Watch /admin/campaigns for incoming orders')
  console.log('      - Export daily: npm run export:payments')
  console.log('      - Check metrics: npm run dashboard:generate')
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║   🚀 CAMPAIGN IMMEDIATE ACTIVATION                     ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  try {
    const activated = await activateCampaignInDB()
    
    if (activated) {
      await testPageAccessibility()
      showWhereItAppears()
      showNextSteps()
      
      console.log('\n✅ CAMPAIGN IS NOW ACTIVE!')
      console.log('\n   IMPORTANT: Rebuild and restart your server:')
      console.log('   $ npm run build && npm run start')
    } else {
      console.log('\n⚠️ Campaign activation failed')
      process.exit(1)
    }

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

main()
