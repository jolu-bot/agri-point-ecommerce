# 📱 SMS PROVIDER SETUP - Infobip & AWS SNS

## 🎯 Étape 1 : Choisir votre Provider

### Option A: Infobip (RECOMMANDÉ)
```
✅ Pros:
   - Coûts bas (~0.05€ par SMS)
   - Enterprise-friendly
   - Webhook intégré
   - Documentation claire
   - Support 24/7

❌ Cons:
   - Compte premium requis
   - Vérification KYC pour Cameroun
```

### Option B: AWS SNS
```
✅ Pros:
   - Si déjà sur AWS
   - Facture unifiée
   - Très fiable (99.99%)
   - Sandbox disponible

❌ Cons:
   - Plus cher pour volume bas (~0.10$ par SMS)
   - Complexe à configurer
   - Limite par pays
```

### Option C: Twilio
```
✅ Pros:
   - Simple à intégrer
   - Bon support

❌ Cons:
   - Plus cher (~0.08$)
   - Pas recommandé pour ce volume
```

---

## 🔑 PART 1: CONFIGURATION INFOBIP (Recommandé)

### Étape 1A: Créer un compte Infobip

```
1. Aller à: https://www.infobip.com
2. Click "Sign Up"
3. Remplir le formulaire:
   - Prénom: [Your Name]
   - Entreprise: Agri-Point
   - Pays: Cameroon
   - Type: Agriculture/Farming
   
4. Email de confirmation reçu
5. Vérifier email + créer mot de passe

6. Dashboard après login:
   https://portal.infobip.com
```

### Étape 1B: Obtenir les Credentials

```bash
# Dans le dashboard Infobip:

1. Allez à: Settings > API Keys
2. Créer une nouvelle API Key:
   - Name: "Agri-Point Campaign"
   - Permissions: SMS Send, SMS Logs
   
3. Copier:
   - API Key: (secret, commençant par "xxxx...")
   - Account SID: (visible dans Settings > Account)
   - Base URL: https://api.infobip.com (standard)
```

### Étape 1C: Ajouter au .env.local

```bash
# .env.local - Ajouter au fichier existant:

# ========== SMS PROVIDER CONFIG ==========
SMS_PROVIDER=infobip
INFOBIP_API_KEY=your_api_key_here
INFOBIP_ACCOUNT_SID=your_account_sid_here
INFOBIP_BASE_URL=https://api.infobip.com
INFOBIP_SENDER_ID=Agri-Point

# SMSProvider failover (optional)
SMS_FALLBACK_PROVIDER=none
```

---

## 🔑 PART 2: CONFIGURATION AWS SNS (Alternative)

### Étape 2A: AWS Setup

```bash
# Si vous avez déjà AWS:

1. Aller à: AWS Console > SNS
2. Créer Topic pour SMS:
   - Name: "agri-point-campaign-sms"
   - Type: Standard
   
3. Dans SNS > SMS Preferences:
   - Default SMSType: Transactional
   - Monthly spend limit: $100 (ou selon budget)
   
4. Ajouter les numéros à whitelist:
   (Required en mode sandbox)
```

### Étape 2B: IAM Credentials

```bash
# IAM > Users > Create User

1. Name: "agri-point-sms"
2. Attach Policy: "AmazonSNSFullAccess"
3. Generate Access Key:
   - Access Key ID: AKIA...
   - Secret Access Key: (keep safe!)
```

### Étape 2C: Ajouter au .env.local

```bash
# .env.local - Alternative AWS:

# ========== AWS SNS CONFIG ==========
SMS_PROVIDER=aws-sns
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_TOPIC_ARN=arn:aws:sns:eu-west-1:ACCOUNT_ID:agri-point-campaign-sms
```

---

## 📦 PART 3: INSTALLER LES DÉPENDANCES

### Pour Infobip:
```bash
npm install infobip-api-node-sdk --save
```

### Pour AWS SNS:
```bash
npm install aws-sdk --save
```

### Installation commune (les deux):
```bash
npm install infobip-api-node-sdk aws-sdk axios dotenv --save
```

---

## 📝 PART 4: CRÉER LE SERVICE SMS

### Créer `lib/sms-service.ts`

```typescript
// lib/sms-service.ts
import { Configuration, SendSmsApi } from 'infobip-api-node-sdk';
import AWS from 'aws-sdk';
import axios from 'axios';

export type SMSProvider = 'infobip' | 'aws-sns' | 'test';

interface SMSParams {
  to: string; // Phone number: +237xxxxxxxxx
  message: string;
  campaignId?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

// INFOBIP SERVICE
class InfobipSMSService {
  private api: SendSmsApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.INFOBIP_API_KEY!,
      basePath: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
    });
    this.api = new SendSmsApi(configuration);
  }

  async send(params: SMSParams): Promise<SendResult> {
    try {
      const response = await this.api.sendSmsMessage({
        sendSmsMessageRequest: {
          messages: [
            {
              destinations: [{ to: params.to }],
              from: process.env.INFOBIP_SENDER_ID || 'Agri-Point',
              text: params.message,
            },
          ],
        },
      });

      const messageId = response?.messages?.[0]?.messageId;
      const status = response?.messages?.[0]?.status?.groupName;

      if (status === 'PENDING' || status === 'SENT') {
        console.log(`✅ SMS sent to ${params.to} (ID: ${messageId})`);
        return {
          success: true,
          messageId,
          provider: 'infobip',
        };
      } else {
        return {
          success: false,
          error: `Failed: ${status}`,
          provider: 'infobip',
        };
      }
    } catch (error: any) {
      console.error('❌ Infobip error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'infobip',
      };
    }
  }
}

// AWS SNS SERVICE
class AwsSNSSMSService {
  private sns: AWS.SNS;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'eu-west-1',
    });
    this.sns = new AWS.SNS();
  }

  async send(params: SMSParams): Promise<SendResult> {
    try {
      const response = await this.sns
        .publish({
          Message: params.message,
          PhoneNumber: params.to,
          MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'AgriPoint',
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional',
            },
          },
        })
        .promise();

      console.log(`✅ SMS sent to ${params.to} (ID: ${response.MessageId})`);
      return {
        success: true,
        messageId: response.MessageId,
        provider: 'aws-sns',
      };
    } catch (error: any) {
      console.error('❌ AWS SNS error:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'aws-sns',
      };
    }
  }
}

// TEST SERVICE (for development)
class TestSMSService {
  async send(params: SMSParams): Promise<SendResult> {
    console.log(`📨 [TEST MODE] SMS to ${params.to}:`);
    console.log(`   Message: "${params.message}"`);
    return {
      success: true,
      messageId: `test-${Date.now()}`,
      provider: 'test',
    };
  }
}

// MAIN SMS SERVICE FACTORY
export class SMSService {
  private service:
    | InfobipSMSService
    | AwsSNSSMSService
    | TestSMSService;
  private provider: SMSProvider;

  constructor(provider?: SMSProvider) {
    this.provider = (provider || process.env.SMS_PROVIDER || 'test') as SMSProvider;

    switch (this.provider) {
      case 'infobip':
        this.service = new InfobipSMSService();
        break;
      case 'aws-sns':
        this.service = new AwsSNSSMSService();
        break;
      case 'test':
      default:
        this.service = new TestSMSService();
        break;
    }

    console.log(`📱 SMS Service initialized with provider: ${this.provider}`);
  }

  async send(params: SMSParams): Promise<SendResult> {
    return this.service.send(params);
  }

  async sendBatch(recipients: string[], message: string): Promise<SendResult[]> {
    console.log(`📊 Sending batch SMS to ${recipients.length} recipients...`);
    const results = await Promise.all(
      recipients.map((to) =>
        this.send({ to, message })
      )
    );

    const successful = results.filter((r) => r.success).length;
    console.log(`✅ ${successful}/${recipients.length} SMS sent successfully`);

    return results;
  }
}

// CAMPAIGN SMS TEMPLATES
export const CAMPAIGN_SMS = {
  announcement: (campaign: any) =>
    `🌾 CAMPAGNE ENGRAIS MARS 2026 - BAS PRIX!

Minéral: 15,000 FCFA/unité • Bio: 10,000 FCFA/unité
✅ Paiement 70% maintenant + 30% à J+60

S'enregistrer: https://agri-point.cm/campagne-engrais`,

  reminder: () =>
    `📢 CAMPAGNE TOUJOURS ACTIVE! 
Engrais -40% jusqu'au 31 Mars.
Minéral: 15,000 FCFA • Bio: 10,000 FCFA
Réserver: https://agri-point.cm/campagne-engrais`,

  lastCall: () =>
    `⚠️ DERNIER JOUR DEMAIN! 
Engrais -40% expire le 31 Mars.
Réserver: https://agri-point.cm/campagne-engrais`,

  paymentReminder: (dueDate: string) =>
    `💰 PAIEMENT DÛ - ${dueDate}
30% des frais de votre commande engrais.
Montant & détails: https://agri-point.cm/compte`,
};
```

---

## 🧪 PART 5: TEST SCRIPT

### Créer `scripts/test-sms-provider.js`

```javascript
// scripts/test-sms-provider.js
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'test';
const API_KEY = process.env.INFOBIP_API_KEY;
const ACCOUNT_SID = process.env.INFOBIP_ACCOUNT_SID;
const PHONE = process.env.SMS_TEST_PHONE || '+237600000000'; // Change this!

async function testInfobip() {
  console.log('\n🧪 Testing Infobip SMS Provider...\n');

  if (!API_KEY) {
    console.error('❌ INFOBIP_API_KEY not configured');
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
            text: '🧪 Test SMS from Agri-Point Campaign System',
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

    if (response.data.messages?.[0]?.status?.groupName === 'PENDING') {
      console.log(`✅ Test SMS sent successfully!`);
      console.log(`   To: ${PHONE}`);
      console.log(`   Message ID: ${response.data.messages[0].messageId}`);
      console.log(`   Status: ${response.data.messages[0].status.groupName}`);
      return true;
    } else {
      console.error('❌ SMS failed:', response.data.messages?.[0]?.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testAwsSNS() {
  console.log('\n🧪 Testing AWS SNS SMS Provider...\n');

  try {
    const AWS = require('aws-sdk');
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'eu-west-1',
    });

    const sns = new AWS.SNS();
    const response = await sns
      .publish({
        Message: '🧪 Test SMS from Agri-Point Campaign System',
        PhoneNumber: PHONE,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'AgriPoint',
          },
        },
      })
      .promise();

    console.log(`✅ Test SMS sent successfully!`);
    console.log(`   To: ${PHONE}`);
    console.log(`   Message ID: ${response.MessageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testSMSProvider() {
  console.log('═══════════════════════════════════════');
  console.log('📱 SMS PROVIDER TEST');
  console.log('═══════════════════════════════════════');
  console.log(`Provider: ${SMS_PROVIDER.toUpperCase()}`);
  console.log(`Test Phone: ${PHONE}`);
  console.log('═══════════════════════════════════════\n');

  let result = false;

  if (SMS_PROVIDER === 'infobip') {
    result = await testInfobip();
  } else if (SMS_PROVIDER === 'aws-sns') {
    result = await testAwsSNS();
  } else if (SMS_PROVIDER === 'test') {
    console.log('✅ Test mode - SMS would be logged (not actually sent)');
    result = true;
  }

  console.log('\n═══════════════════════════════════════');
  if (result) {
    console.log('✨ SMS Provider test PASSED! ✅');
  } else {
    console.log('❌ SMS Provider test FAILED');
    console.log('   Check your API keys & configuration');
  }
  console.log('═══════════════════════════════════════\n');

  process.exit(result ? 0 : 1);
}

testSMSProvider();
```

---

## 🎯 PART 6: API ENDPOINT POUR ENVOYER SMS

### Créer `app/api/sms/send/route.ts`

```typescript
// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SMSService, CAMPAIGN_SMS } from '@/lib/sms-service';

export async function POST(req: NextRequest) {
  try {
    // 🔐 Authentication check
    const authToken = req.headers.get('authorization');
    if (authToken !== `Bearer ${process.env.ADMIN_SMS_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipients, templateKey } = await req.json();

    if (!recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'recipients must be an array' },
        { status: 400 }
      );
    }

    if (!templateKey || !CAMPAIGN_SMS[templateKey as keyof typeof CAMPAIGN_SMS]) {
      return NextResponse.json(
        { error: 'Invalid template' },
        { status: 400 }
      );
    }

    // Get message from template
    const messageTemplate = CAMPAIGN_SMS[templateKey as keyof typeof CAMPAIGN_SMS];
    const message = typeof messageTemplate === 'function' ? messageTemplate({}) : messageTemplate;

    // Send SMS
    const smsService = new SMSService();
    const results = await smsService.sendBatch(recipients, message);

    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      total: results.length,
      results,
    });

  } catch (error: any) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📋 PART 7: CONFIGURATION CHECKLIST

```bash
INFOBIP SETUP:
□ Account created at https://infobip.com
□ Email verified
□ API Key obtained
□ Account SID obtained
□ INFOBIP_API_KEY added to .env.local
□ INFOBIP_ACCOUNT_SID added to .env.local
□ INFOBIP_SENDER_ID configured (default: "Agri-Point")

AWS SNS SETUP (if chosen):
□ AWS Account active
□ IAM User created
□ SNS Topic created
□ Access Key ID obtained
□ Secret Access Key obtained
□ AWS credentials added to .env.local
□ Weekly spending limit set ($100)

GENERAL SETUP:
□ npm install infobip-api-node-sdk --save (for Infobip)
□ npm install aws-sdk --save (for AWS SNS)
□ SMS_PROVIDER set in .env.local
□ ADMIN_SMS_TOKEN generated (random string)
□ Test phone number configured
□ SMS templates reviewed in lib/sms-service.ts
□ Test script created: scripts/test-sms-provider.js
□ API endpoint created: app/api/sms/send/route.ts
```

---

## 🚀 PART 8: TESTING & VERIFICATION

### Test 1: Provider Configuration
```bash
npm run build      # Should complete without errors
echo $SMS_PROVIDER  # Should show: infobip or aws-sns or test
```

### Test 2: Send Test SMS
```bash
# Edit SMS_TEST_PHONE in scripts/test-sms-provider.js
# Use your personal phone number

node scripts/test-sms-provider.js

# Expected output:
# ✅ Test SMS sent successfully!
#    To: +237XXXXXXXXX
#    Message ID: xxxx-xxxx-xxxx
```

### Test 3: API Endpoint
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Authorization: Bearer YOUR_ADMIN_SMS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+237XXXXXXXXX"],
    "templateKey": "announcement"
  }'

# Expected response:
# { "success": true, "sent": 1, "failed": 0, "total": 1 }
```

---

## 🎯 PRODUCTION DEPLOYMENT

### Before Go-Live:

1. **Infobip Account Verification:**
   ```
   - Email confirmed
   - Payment method added
   - Phone numbers verified (if required by country)
   - API Key active
   ```

2. **Production Credentials:**
   ```bash
   # Hostinger VPS:
   - Add INFOBIP_API_KEY to env vars
   - Add INFOBIP_SENDER_ID
   - Add ADMIN_SMS_TOKEN (strong random)
   - Restart PM2 app: pm2 restart agri-point
   ```

3. **Send Batch SMS Command:**
   ```bash
   # From admin panel or direct API:
   curl -X POST https://yourdomain.cm/api/sms/send \
     -H "Authorization: Bearer ADMIN_SMS_TOKEN" \
     -d '{
       "recipients": ["+237600000001", "+237600000002"],
       "templateKey": "announcement"
     }'
   ```

4. **Monitor Logs:**
   ```bash
   pm2 logs agri-point | grep "SMS"
   ```

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "INFOBIP_API_KEY not set" | Check .env.local file, restart npm dev |
| SMS not sending | Verify phone format: +237XXXXXXXXX (11 digits) |
| 401 Unauthorized API | Check ADMIN_SMS_TOKEN matches |
| High SMS costs | Confirm Infobip pricing, set monthly limit |
| Delivery failed | Check recipient phone format & network |

---

**Ready for production deployment!** ✅

