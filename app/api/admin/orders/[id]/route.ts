import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';

// GET - Récupérer une commande par ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();
    const order = await Order.findById(paramsObj.id)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur GET /api/admin/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le statut d'une commande
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await context.params;
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);
    
    if (!decoded || !['admin', 'manager'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();

    const order = await Order.findByIdAndUpdate(
      paramsObj.id,
      body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Erreur PUT /api/admin/orders/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}
