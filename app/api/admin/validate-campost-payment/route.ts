import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { orderId, approved, validationNotes } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID commande requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (!order.campostPayment?.receiptImage) {
      return NextResponse.json(
        { error: 'Aucun reçu à valider' },
        { status: 400 }
      );
    }

    if (approved) {
      // Valider le paiement
      order.campostPayment.validatedAt = new Date();
      order.campostPayment.validatedBy = decoded.userId;
      order.campostPayment.validationNotes = validationNotes || 'Paiement validé';
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        transactionId: order.orderNumber,
        paidAt: new Date(),
      };
      order.status = 'confirmed';
    } else {
      // Refuser le paiement
      order.campostPayment.validationNotes = validationNotes || 'Paiement refusé';
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.adminNotes = `Paiement Campost refusé: ${validationNotes}`;
    }

    await order.save();

    // TODO: Envoyer notification au client
    // await sendCustomerNotification(order, approved);

    return NextResponse.json({
      success: true,
      message: approved ? 'Paiement validé' : 'Paiement refusé',
      order,
    });
  } catch (error) {
    console.error('Erreur validation paiement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
