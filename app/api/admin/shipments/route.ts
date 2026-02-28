import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/admin/shipments
 * Récupérer toutes les livraisons avec statut
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const shipments = await Order.find({
      // Ne montrer que les commandes payées ou en préparation
      paymentStatus: { $in: ['paid', 'awaiting_proof'] },
    })
      .populate('user', 'name email phone')
      .select(
        'orderNumber items total status paymentStatus shippingAddress createdAt campostPayment installmentPayment'
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedShipments = shipments.map((order: any) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.name || order.user?.name || 'N/A',
      customerPhone: order.shippingAddress?.phone || order.user?.phone || 'N/A',
      address: order.shippingAddress?.street || 'Non fournie',
      city: order.shippingAddress?.city || 'N/A',
      region: order.shippingAddress?.region || 'N/A',
      status: order.status || 'pending',
      items: order.items || [],
      total: order.total || 0,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      shippedDate: order.shiftedAt,
      deliveredDate: order.deliveredAt,
    }));

    return NextResponse.json({ shipments: formattedShipments });
  } catch (error) {
    console.error('Erreur chargement livraisons:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/shipments?id=[orderId]
 * Mettre à jour le statut d'une livraison
 */
export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    const { status, trackingNumber, notes } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        trackingNumber,
        adminNotes: notes,
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erreur update livraison:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
