import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

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
