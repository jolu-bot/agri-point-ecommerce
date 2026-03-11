import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { SMSService, ORDER_STATUS_SMS } from '@/lib/sms-service';
import { sendOrderStatusUpdate } from '@/lib/email-service';

const verifyToken = async (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_ici') as { userId: string; role: string };
  } catch {
    return null;
  }
};

// GET /api/orders/[id] - Récupérer une commande spécifique
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const paramsObj = await context.params;
    const order = await Order.findById(paramsObj.id).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la commande appartient à l'utilisateur (sauf admin)
    if (order.user.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] — Mise à jour du statut (admin uniquement)
// Déclenche automatiquement SMS + email au client
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Seuls admin et manager peuvent changer le statut
    const operator = await User.findById(decoded.userId).select('role').lean();
    if (!operator || !['admin', 'manager'].includes(operator.role as string)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const paramsObj = await context.params;
    const body = await request.json();
    const { status, note, tracking } = body as {
      status: string;
      note?: string;
      tracking?: { carrier?: string; trackingNumber?: string };
    };

    const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const order = await Order.findById(paramsObj.id);
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    const previousStatus = order.status;
    if (previousStatus === status) {
      return NextResponse.json({ error: 'La commande a déjà ce statut' }, { status: 400 });
    }

    // Mise à jour du statut
    order.status = status as typeof order.status;

    // Tracking info si expédiée
    if (status === 'shipped' && tracking) {
      if (!order.tracking) order.tracking = {};
      if (tracking.carrier) order.tracking.carrier = tracking.carrier;
      if (tracking.trackingNumber) order.tracking.trackingNumber = tracking.trackingNumber;
      order.tracking.shippedAt = new Date();
    }
    if (status === 'delivered' && order.tracking) {
      order.tracking.deliveredAt = new Date();
    }

    // Récupérer le client pour SMS + email
    const customer = await User.findById(order.user).select('name email phone').lean() as {
      name?: string; email?: string; phone?: string;
    } | null;

    let smsSent = false;
    let emailSent = false;

    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';
    const trackingUrl = `${BASE_URL}/commande/${order._id}`;

    // Envoi SMS si numéro disponible
    const phoneNumber = customer?.phone || order.shippingAddress.phone;
    const smsTemplate = ORDER_STATUS_SMS[status];
    if (phoneNumber && smsTemplate) {
      try {
        const smsService = new SMSService();
        const message = smsTemplate(
          order.orderNumber,
          trackingUrl,
          order.tracking?.trackingNumber,
        );
        const result = await smsService.send({ to: phoneNumber, message });
        smsSent = result.success;
      } catch (smsErr) {
        console.error('SMS status update failed:', smsErr);
      }
    }

    // Envoi email si adresse disponible
    if (customer?.email) {
      try {
        emailSent = await sendOrderStatusUpdate(
          order.toObject(),
          customer.email,
          customer.name || order.shippingAddress.name,
          status,
          note,
        );
      } catch (emailErr) {
        console.error('Email status update failed:', emailErr);
      }
    }

    // Ajouter à l'historique
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: status as typeof order.status,
      note,
      timestamp: new Date(),
      smsSent,
      emailSent,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      order,
      notifications: { smsSent, emailSent },
    });
  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
