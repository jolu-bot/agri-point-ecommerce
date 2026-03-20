import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { SMSService, ORDER_STATUS_SMS } from '@/lib/sms-service';
import { sendOrderStatusUpdate } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || !['admin', 'manager', 'redacteur'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { status: newStatus, note = '', trackingNumber } = body;
    const paramsObj = await context.params;

    // Fetch full order with customer details for notifications
    const order = await Order.findById(paramsObj.id).populate('user', 'name email phone');

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // ── Notifications (non-blocking) ─────────────────────────────────────────
    let smsSent   = false;
    let emailSent = false;

    const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const orderRef    = (order.orderNumber as string | undefined) ?? paramsObj.id;
    const trackingUrl = `${siteUrl}/commande/${orderRef}`;
    const smsTemplate = ORDER_STATUS_SMS[newStatus];

    if (smsTemplate && order.user?.phone) {
      try {
        const smsService = new SMSService();
        const raw   = String(order.user.phone).replace(/[\s-]/g, '');
        const phone = raw.startsWith('+') ? raw : raw.startsWith('237') ? `+${raw}` : `+237${raw}`;
        const result = await smsService.send({
          to: phone,
          message: smsTemplate(orderRef, trackingUrl, trackingNumber),
        });
        smsSent = result.success;
      } catch { /* silent — notification failure must not block order update */ }
    }

    if (order.user?.email) {
      try {
        emailSent = await sendOrderStatusUpdate(
          order.user.email,
          (order.user.name as string | undefined) || 'Client',
          orderRef,
          newStatus,
          trackingNumber,
        );
      } catch { /* silent */ }
    }

    // ── Update order + append history ─────────────────────────────────────────
    const setFields: Record<string, unknown> = { status: newStatus };
    if (trackingNumber) setFields['tracking.trackingNumber'] = trackingNumber;

    const historyEntry = {
      status:    newStatus,
      note,
      timestamp: new Date(),
      smsSent,
      emailSent,
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      paramsObj.id,
      { $set: setFields, $push: { statusHistory: historyEntry } },
      { new: true }
    );

    return NextResponse.json({ success: true, order: updatedOrder, smsSent, emailSent });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

