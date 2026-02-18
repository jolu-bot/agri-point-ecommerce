import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    let query: any = { paymentMethod: 'campost' };

    if (filter === 'awaiting') {
      query.paymentStatus = 'awaiting_proof';
      query['campostPayment.receiptImage'] = { $exists: true, $ne: null };
      query['campostPayment.validatedAt'] = { $exists: false };
    } else if (filter === 'validated') {
      query['campostPayment.validatedAt'] = { $exists: true };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('campostPayment.validatedBy', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Erreur récupération commandes Campost:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
