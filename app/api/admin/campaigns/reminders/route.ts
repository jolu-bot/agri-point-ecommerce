/**
 * GET  /api/admin/campaigns/reminders
 *   → Retourne toutes les commandes campagne avec 2ème tranche en attente
 *
 * POST /api/admin/campaigns/reminders
 *   → Enregistre manuellement un rappel pour une liste d'ordres (simulation SMS)
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// Date limite officielle 2ème tranche
const SECOND_TRANCHE_DUE = new Date('2026-04-30T23:59:59');
// Date de rappel officielle
const REMINDER_DATE = new Date('2026-04-13T00:00:00');

export async function GET(req: Request) {
  try {
    await dbConnect();

    const now = new Date();
    const url = new URL(req.url);
    const urgentOnly = url.searchParams.get('urgent') === 'true';

    // Commandes campagne avec 2ème tranche en attente
    const query: Record<string, unknown> = {
      isCampaignOrder: true,
      'installmentPayment.enabled': true,
      'installmentPayment.secondPaymentStatus': 'pending',
    };

    // Si "urgent" : uniquement les commandes dont la date limite est dans ≤ 17 jours ou dépassée
    if (urgentOnly) {
      const urgentThreshold = new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000);
      query['$or'] = [
        { 'installmentPayment.secondPaymentDueDate': { $lte: urgentThreshold } },
        { 'installmentPayment.secondPaymentDueDate': { $exists: false } }, // pas de date → utiliser la date par défaut (30 avril)
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'email firstName lastName phone')
      .sort({ createdAt: 1 })
      .lean();

    const result = orders.map((order) => {
      const dueDate = (order.installmentPayment as Record<string, unknown>)?.secondPaymentDueDate
        ? new Date((order.installmentPayment as Record<string, unknown>).secondPaymentDueDate as Date)
        : SECOND_TRANCHE_DUE;

      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000);
      const isOverdue = daysUntilDue < 0;
      const isUrgent = !isOverdue && daysUntilDue <= 17;

      const user = order.user as unknown as Record<string, unknown> | null;

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        contactName: (order.shippingAddress as Record<string, unknown>)?.name ?? (user?.firstName ?? ''),
        contactPhone: (order.shippingAddress as Record<string, unknown>)?.phone ?? (user?.phone ?? ''),
        contactEmail: (user?.email as string) ?? '',
        secondAmount: (order.installmentPayment as Record<string, unknown>)?.secondAmount ?? 0,
        dueDate: dueDate.toISOString(),
        daysUntilDue,
        isOverdue,
        isUrgent,
        status: isOverdue ? 'overdue' : isUrgent ? 'urgent' : 'pending',
        createdAt: order.createdAt,
      };
    });

    const summary = {
      total: result.length,
      overdue: result.filter((r) => r.isOverdue).length,
      urgent: result.filter((r) => r.isUrgent && !r.isOverdue).length,
      pending: result.filter((r) => !r.isUrgent && !r.isOverdue).length,
      totalAmount: result.reduce((sum, r) => sum + (r.secondAmount as number), 0),
      reminderDate: REMINDER_DATE.toISOString(),
      dueDate: SECOND_TRANCHE_DUE.toISOString(),
    };

    return NextResponse.json({ summary, orders: result });
  } catch (error) {
    console.error('Erreur reminders:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json() as { orderIds?: string[]; channel?: string; message?: string };
    const { orderIds, channel = 'sms', message } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds requis (tableau non vide)' }, { status: 400 });
    }

    const validChannels = ['sms', 'email', 'whatsapp'];
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ error: `Canal invalide. Valeurs: ${validChannels.join(', ')}` }, { status: 400 });
    }

    // Récupérer les commandes concernées
    const orders = await Order.find({
      _id: { $in: orderIds },
      isCampaignOrder: true,
      'installmentPayment.enabled': true,
      'installmentPayment.secondPaymentStatus': 'pending',
    })
      .populate('user', 'email firstName lastName phone')
      .lean();

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Aucune commande éligible trouvée' }, { status: 404 });
    }

    // Template de message par défaut
    const defaultMsg =
      `Rappel AGRI POINT : votre 2ème tranche (30%) est due avant le 30 avril 2026. ` +
      `Rendez-vous au bureau Campost le plus proche. Infos : +237 651 92 09 20`;

    const finalMessage = message ?? defaultMsg;

    // Simulation d'envoi (en production, intégrer Infobip / OrangeSMS / MTN SMS)
    const sent: string[] = [];
    const failed: string[] = [];

    for (const order of orders) {
      const phone = (order.shippingAddress as Record<string, unknown>)?.phone as string | undefined;
      const user = order.user as unknown as Record<string, unknown> | null;
      const email = (user?.email as string) ?? '';
      const recipient = channel === 'email' ? email : phone;

      if (recipient) {
        // TODO: intégrer le vrai fournisseur SMS/email ici
        console.log(`[RAPPEL ${channel.toUpperCase()}] → ${recipient} : ${finalMessage}`);
        sent.push(order._id.toString());
      } else {
        failed.push(order._id.toString());
      }
    }

    return NextResponse.json({
      success: true,
      channel,
      message: finalMessage,
      sent: sent.length,
      failed: failed.length,
      sentIds: sent,
      failedIds: failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur envoi rappels:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
