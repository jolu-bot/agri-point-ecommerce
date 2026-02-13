#!/usr/bin/env node
// Test campaign page and API endpoints
const fetch = global.fetch || require('node-fetch')

const BASE_URL = process.env.API_URL || 'http://localhost:3000'

async function test(name, url, method = 'GET') {
  try {
    console.log(`\n🔍 Testing: ${name}`)
    console.log(`   URL: ${url}`)
    const res = await fetch(url, { method })
    console.log(`   Status: ${res.status} ${res.statusText}`)
    if (res.ok) {
      const text = await res.text()
      const preview = text.substring(0, 200)
      console.log(`   ✅ OK — ${preview.length} chars returned`)
      if (preview.includes('campagne') || preview.includes('engrais') || preview.includes('Engrais')) {
        console.log(`   ✅ Campaign content found`)
      }
    } else {
      console.log(`   ❌ FAILED`)
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`)
  }
}

async function main() {
  console.log(`\n📋 Campaign Visibility Test`)
  console.log(`Base URL: ${BASE_URL}`)

  // Test public page
  await test('Campaign public page', `${BASE_URL}/campagne-engrais`)

  // Test API endpoints
  await test('Campaign API (slug)', `${BASE_URL}/api/campaigns/engrais-mars-2026`)
  await test('Campaign API (specific)', `${BASE_URL}/api/campaigns/march-2026`)

  console.log(`\n✅ Test complete\n`)
}

main()
