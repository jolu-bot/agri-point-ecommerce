import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

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

    // Envoyer notification au client
    try {
      const user = await User.findById(order.user).select('email firstName').lean() as { email?: string; firstName?: string } | null;
      const email = user?.email;
      if (email) {
        const subject = approved
          ? `✅ Paiement confirmé — Commande ${order.orderNumber}`
          : `❌ Paiement refusé — Commande ${order.orderNumber}`;
        const html = approved
          ? `<p>Bonjour${user?.firstName ? ' ' + user.firstName : ''},</p>
             <p>Votre paiement Campost pour la commande <strong>${order.orderNumber}</strong> a été <strong>validé</strong>. Votre commande est en cours de traitement.</p>
             ${validationNotes ? `<p>Note : ${validationNotes}</p>` : ''}
             <p>Merci de votre confiance.<br>AGRI POINT SERVICES SARL</p>`
          : `<p>Bonjour${user?.firstName ? ' ' + user.firstName : ''},</p>
             <p>Votre paiement Campost pour la commande <strong>${order.orderNumber}</strong> a été <strong>refusé</strong>.</p>
             ${validationNotes ? `<p>Motif : ${validationNotes}</p>` : ''}
             <p>Veuillez nous contacter au +237 651 92 09 20 pour toute question.<br>AGRI POINT SERVICES SARL</p>`;
        await sendEmail({ to: email, subject, html });
      }
    } catch (notifErr) {
      console.error('Erreur notification client:', notifErr);
    }

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
