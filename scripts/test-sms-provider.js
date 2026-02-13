// scripts/test-sms-provider.js
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'test';
const API_KEY = process.env.INFOBIP_API_KEY;
const PHONE = '+237600000000'; // ⚠️  CHANGE THIS to your phone number before testing

async function testInfobip() {
  console.log('\n🧪 Testing Infobip SMS Provider...\n');

  if (!API_KEY) {
    console.error('❌ INFOBIP_API_KEY not configured in .env.local');
    console.error('   Please add: INFOBIP_API_KEY=your_api_key');
    return false;
  }

  try {
    const response = await axios.post(
      'https://api.infobip.com/sms/2/text/advanced',
      {
        messages: [
          {
            destinations: [{ to: PHONE }],
            from: 'Agri-Point',
            text: '🧪 Test SMS from Agri-Point Campaign System - Configuration OK ✅',
          },
        ],
      },
      {
        headers: {
          Authorization: `App ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const status = response.data.messages?.[0]?.status?.groupName;
    const messageId = response.data.messages?.[0]?.messageId;

    if (status === 'PENDING' || status === 'SENT') {
      console.log(`✅ Test SMS sent successfully!`);
      console.log(`   Recipient: ${PHONE}`);
      console.log(`   Message ID: ${messageId}`);
      console.log(`   Status: ${status}`);
      console.log(`   Provider: Infobip`);
      return true;
    } else {
      console.error('❌ SMS failed:', status);
      console.error('   Response:', response.data.messages?.[0]?.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Infobip error:', error.response?.data || error.message);
    return false;
  }
}

async function testTestMode() {
  console.log('\n🧪 Testing TEST MODE SMS Provider...\n');
  console.log(`📨 [TEST MODE] SMS to ${PHONE}:`);
  console.log(`   "🧪 Test SMS from Agri-Point Campaign System - Configuration OK ✅"`);
  console.log(`   Message ID: test-${Date.now()}`);
  console.log(`   Provider: test`);
  console.log('\n✅ Test SMS logged successfully! (Not actually sent)');
  return true;
}

async function testSMSProvider() {
  console.log('\n════════════════════════════════════════════');
  console.log('📱 SMS PROVIDER CONFIGURATION TEST');
  console.log('════════════════════════════════════════════');
  console.log(`Provider: ${SMS_PROVIDER.toUpperCase()}`);
  console.log(`Test Phone: ${PHONE}`);
  console.log('════════════════════════════════════════════');

  let result = false;

  if (SMS_PROVIDER === 'infobip') {
    result = await testInfobip();
  } else if (SMS_PROVIDER === 'test') {
    result = await testTestMode();
  } else {
    console.error(`❌ Unknown SMS provider: ${SMS_PROVIDER}`);
    result = false;
  }

  console.log('\n════════════════════════════════════════════');
  if (result) {
    console.log('✨ SMS Provider Test PASSED! ✅');
    console.log('   Ready for campaign deployment');
  } else {
    console.log('❌ SMS Provider Test FAILED');
    console.log('   Check your configuration:');
    console.log(`   1. SMS_PROVIDER=${SMS_PROVIDER}`);
    console.log(`   2. INFOBIP_API_KEY is set`);
    console.log(`   3. Update PHONE number in script`);
  }
  console.log('════════════════════════════════════════════\n');

  process.exit(result ? 0 : 1);
}

testSMSProvider();
