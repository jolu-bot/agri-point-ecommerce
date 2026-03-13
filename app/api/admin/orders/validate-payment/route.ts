import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    
    // Vérifier que l'utilisateur est admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé - Rôle admin requis' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId, action, notes } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    const adminId = decoded.userId;

    if (action === 'approve') {
      // Approuver le paiement
      if (order.paymentMethod === 'whatsapp') {
        order.whatsappPayment = {
          ...order.whatsappPayment,
          validatedBy: adminId,
          validatedAt: new Date(),
          validationNotes: notes || 'Paiement validé',
          paymentConfirmedAt: new Date(),
        };
      } else if (order.paymentMethod === 'campost') {
        order.campostPayment = {
          ...order.campostPayment,
          accountNumber: order.campostPayment?.accountNumber ?? '',
          accountName: order.campostPayment?.accountName ?? '',
          validatedBy: adminId,
          validatedAt: new Date(),
          validationNotes: notes || 'Reçu validé',
        };
      }

      order.paymentStatus = 'paid';
      order.status = 'confirmed';

      await order.save();

      // Envoyer email de confirmation au client
      try {
        const customerEmail = (order.user as any).email;
        const customerName = (order.user as any).name;
        
        await sendEmail({
          to: customerEmail,
          subject: `✅ Paiement validé - Commande ${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">✅ Paiement Confirmé !</h2>
              
              <p>Bonjour <strong>${customerName}</strong>,</p>
              
              <p>Excellente nouvelle ! Votre paiement pour la commande <strong>${order.orderNumber}</strong> a été validé avec succès.</p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Montant payé :</strong> ${order.total.toLocaleString('fr-FR')} F CFA</p>
                <p style="margin: 10px 0 0;"><strong>Méthode :</strong> ${
                  order.paymentMethod === 'whatsapp' ? 'Mobile Money (WhatsApp)' :
                  order.paymentMethod === 'campost' ? 'Campost' :
                  'Paiement à la livraison'
                }</p>
              </div>
              
              <p><strong>Prochaine étape :</strong> Votre commande est maintenant en préparation. Vous recevrez une notification dès son expédition.</p>
              
              <p>Vous pouvez suivre l'état de votre commande à tout moment sur votre espace client.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  Merci de votre confiance !<br>
                  📞 +237 657 39 39 39 | 💬 WhatsApp<br>
                  L'équipe AGRIPOINT SERVICES
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Erreur envoi email confirmation:', emailError);
        // Ne pas bloquer le processus si l'email échoue
      }

      return NextResponse.json({
        success: true,
        message: 'Paiement validé avec succès',
        order,
      });

    } else if (action === 'reject') {
      // Rejeter le paiement
      if (order.paymentMethod === 'whatsapp') {
        order.whatsappPayment = {
          ...order.whatsappPayment,
          validatedBy: adminId,
          validatedAt: new Date(),
          validationNotes: notes || 'Paiement rejeté - preuve invalide',
        };
      } else if (order.paymentMethod === 'campost') {
        order.campostPayment = {
          ...order.campostPayment,
          accountNumber: order.campostPayment?.accountNumber ?? '',
          accountName: order.campostPayment?.accountName ?? '',
          validatedBy: adminId,
          validatedAt: new Date(),
          validationNotes: notes || 'Reçu rejeté - document invalide',
        };
      }

      order.paymentStatus = 'failed';
      order.status = 'cancelled';

      await order.save();

      // Envoyer email au client expliquant le rejet
      try {
        const customerEmail = (order.user as any).email;
        const customerName = (order.user as any).name;
        
        await sendEmail({
          to: customerEmail,
          subject: `⚠️ Problème avec votre paiement - Commande ${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">⚠️ Paiement non validé</h2>
              
              <p>Bonjour <strong>${customerName}</strong>,</p>
              
              <p>Nous avons rencontré un problème avec la preuve de paiement que vous avez soumise pour la commande <strong>${order.orderNumber}</strong>.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Raison :</strong></p>
                <p style="margin: 10px 0 0;">${notes || 'Document illisible ou informations incorrectes'}</p>
              </div>
              
              <p><strong>Que faire maintenant ?</strong></p>
              <ul>
                <li>Vérifiez que la capture d'écran/reçu est claire et lisible</li>
                <li>Assurez-vous que le montant et la date sont visibles</li>
                <li>Re-soumettez une nouvelle preuve de paiement valide</li>
              </ul>
              
              <p>Si vous avez effectué le paiement mais que la preuve n'est pas valide, contactez-nous immédiatement :</p>
              <p>📞 <strong>+237 657 39 39 39</strong> | 💬 <strong>WhatsApp</strong></p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  L'équipe AGRIPOINT SERVICES
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Erreur envoi email rejet:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Paiement rejeté',
        order,
      });

    } else {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Erreur validation paiement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
