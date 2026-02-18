// lib/sms-service.ts
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
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.INFOBIP_API_KEY || '';
    this.senderId = process.env.INFOBIP_SENDER_ID || 'Agri-Point';
    this.baseUrl = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';

    if (!this.apiKey) {
      console.warn('⚠️  INFOBIP_API_KEY not configured');
    }
  }

  async send(params: SMSParams): Promise<SendResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sms/2/text/advanced`,
        {
          messages: [
            {
              destinations: [{ to: params.to }],
              from: this.senderId,
              text: params.message,
            },
          ],
        },
        {
          headers: {
            Authorization: `App ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const messageId = response.data.messages?.[0]?.messageId;
      const status = response.data.messages?.[0]?.status?.groupName;

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

// TEST SERVICE (for development)
class TestSMSService {
  async send(params: SMSParams): Promise<SendResult> {
    console.log(`📨 [TEST MODE] SMS to ${params.to}:`);
    console.log(`   "${params.message}"`);
    return {
      success: true,
      messageId: `test-${Date.now()}`,
      provider: 'test',
    };
  }
}

// MAIN SMS SERVICE FACTORY
export class SMSService {
  private service: InfobipSMSService | TestSMSService;
  private provider: SMSProvider;

  constructor(provider?: SMSProvider) {
    this.provider = (provider || process.env.SMS_PROVIDER || 'test') as SMSProvider;

    switch (this.provider) {
      case 'infobip':
        this.service = new InfobipSMSService();
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
  announcement: () =>
    `🌾 CAMPAGNE ENGRAIS MARS 2026 - BAS PRIX!

Minéral: 15,000 FCFA/unité • Bio: 10,000 FCFA/unité
✅ Paiement 70% maintenant + 30% à J+60

S'enregistrer: https://agri-ps.com/campagne-engrais`,

  reminder: () =>
    `📢 CAMPAGNE TOUJOURS ACTIVE! 
Engrais -40% jusqu'au 31 Mars.
Minéral: 15,000 FCFA • Bio: 10,000 FCFA
Réserver: https://agri-ps.com/campagne-engrais`,

  lastCall: () =>
    `⚠️ DERNIER JOUR DEMAIN! 
Engrais -40% expire le 31 Mars.
Réserver: https://agri-ps.com/campagne-engrais`,

  paymentReminder: (dueDate: string) =>
    `💰 PAIEMENT DÛ - ${dueDate}
30% de votre commande engrais.
Détails: https://agri-ps.com/compte`,
};
