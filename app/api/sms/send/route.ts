// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SMSService, CAMPAIGN_SMS } from '@/lib/sms-service';

interface SendSMSRequest {
  recipients: string[];
  templateKey: keyof typeof CAMPAIGN_SMS;
  dueDate?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Authentication check - require admin token
    const authHeader = req.headers.get('authorization');
    const adminToken = process.env.ADMIN_SMS_TOKEN;

    if (!adminToken) {
      console.error('❌ ADMIN_SMS_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== adminToken) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: SendSMSRequest = await req.json();

    // Validate input
    if (!body.recipients || !Array.isArray(body.recipients)) {
      return NextResponse.json(
        { error: 'recipients must be an array of phone numbers' },
        { status: 400 }
      );
    }

    if (body.recipients.length === 0) {
      return NextResponse.json(
        { error: 'recipients array cannot be empty' },
        { status: 400 }
      );
    }

    if (!body.templateKey) {
      return NextResponse.json(
        { error: 'templateKey is required' },
        { status: 400 }
      );
    }

    // Validate template exists
    if (!(body.templateKey in CAMPAIGN_SMS)) {
      return NextResponse.json(
        { error: `Invalid template. Available: ${Object.keys(CAMPAIGN_SMS).join(', ')}` },
        { status: 400 }
      );
    }

    // Get message from template
    const templateFn = CAMPAIGN_SMS[body.templateKey];
    let message: string;

    if (typeof templateFn === 'function') {
      message = (templateFn as any)(body.dueDate || '');
    } else {
      message = templateFn;
    }

    // Validate message length (SMS limit: 160 chars, warn if >)
    if (message.length > 160) {
      console.warn(`⚠️  SMS message exceeds 160 chars: ${message.length} chars`);
    }

    // Validate phone numbers
    const validPhones = body.recipients.filter((phone) => {
      const isValid = /^\+\d{10,}$/.test(phone);
      if (!isValid) {
        console.warn(`⚠️  Invalid phone format: ${phone}`);
      }
      return isValid;
    });

    if (validPhones.length === 0) {
      return NextResponse.json(
        { error: 'No valid phone numbers provided (format: +237XXXXXXXXX)' },
        { status: 400 }
      );
    }

    console.log(`\n📱 SMS Send Request:`);
    console.log(`   Template: ${body.templateKey}`);
    console.log(`   Recipients: ${validPhones.length}`);
    console.log(`   Message length: ${message.length} chars`);

    // Send SMS using SMS service
    const smsService = new SMSService();
    const results = await smsService.sendBatch(validPhones, message);

    // Calculate statistics
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n✅ SMS sending complete:`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${results.length}\n`);

    // Return response
    return NextResponse.json({
      success: true,
      message: `SMS campaign sent: ${successful}/${results.length} successful`,
      stats: {
        sent: successful,
        failed: failed,
        total: results.length,
      },
      template: body.templateKey,
      provider: process.env.SMS_PROVIDER || 'test',
      results: results.map((r) => ({
        success: r.success,
        messageId: r.messageId,
        error: r.error,
      })),
    });

  } catch (error: any) {
    console.error('❌ SMS send error:', error.message);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET endpoint for testing/status
export async function GET(req: NextRequest) {
  const provider = process.env.SMS_PROVIDER || 'test';
  const hasKey = !!process.env.INFOBIP_API_KEY;

  return NextResponse.json({
    status: 'SMS Service Active',
    provider,
    configured: hasKey ? 'Yes (production)' : 'No (test mode)',
    templates: Object.keys(CAMPAIGN_SMS),
    endpoint: 'POST /api/sms/send',
    requiresAuth: 'Bearer token (ADMIN_SMS_TOKEN)',
  });
}
