import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const receipt = formData.get('receipt') as File;
    const orderId = formData.get('orderId') as string;

    if (!receipt || !orderId) {
      return NextResponse.json(
        { error: 'Fichier et ID commande requis' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await receipt.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer le dossier receipts s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'receipts');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = receipt.name.split('.').pop();
    const fileName = `receipt-${orderId}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Sauvegarder le fichier
    await writeFile(filePath, buffer);

    // Mettre à jour la commande selon la méthode de paiement
    const publicUrl = `/receipts/${fileName}`;
    
    if (order.paymentMethod === 'whatsapp') {
      // Paiement WhatsApp Mobile Money
      order.whatsappPayment = {
        ...order.whatsappPayment,
        screenshotUrl: publicUrl,
        screenshotUploadedAt: new Date(),
      };
    } else {
      // Paiement Campost (par défaut)
      order.campostPayment = {
        accountNumber: order.campostPayment?.accountNumber || 'XXXX-XXXX-XXXX',
        accountName: order.campostPayment?.accountName || 'AGRIPOINT SERVICES',
        ...order.campostPayment,
        receiptImage: publicUrl,
        receiptUploadedAt: new Date(),
      };
    }
    
    order.paymentStatus = 'awaiting_proof';
    order.status = 'awaiting_payment';
    await order.save();

    // Envoyer notification à l'admin
    try {
      const paymentMethodLabel = order.paymentMethod === 'whatsapp' 
        ? 'Mobile Money (WhatsApp)' 
        : order.paymentMethod === 'campost' 
        ? 'Campost' 
        : 'Paiement à la livraison';

      const customerName = (order.user as any)?.name || 'Client inconnu';
      
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@agri-ps.com',
        subject: `🔔 Nouvelle preuve de paiement à valider - ${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 24px;">🔔 Nouvelle Preuve de Paiement</h2>
            </div>
            
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-weight: bold;">⏰ Action requise : Validation sous 2 heures</p>
              </div>

              <h3 style="color: #1f2937; margin-top: 0;">Détails de la commande</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Commande</td>
                  <td style="padding: 12px 0; text-align: right; color: #1f2937; font-weight: bold;">
                    ${order.orderNumber}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Client</td>
                  <td style="padding: 12px 0; text-align: right; color: #1f2937;">
                    ${customerName}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Montant</td>
                  <td style="padding: 12px 0; text-align: right; color: #1f2937; font-weight: bold; font-size: 18px;">
                    ${order.total.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Méthode</td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
                      ${paymentMethodLabel}
                    </span>
                  </td>
                </tr>
                ${order.paymentMethod === 'whatsapp' && (order.whatsappPayment as any)?.mobileMoneyProvider ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Opérateur</td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="background-color: ${(order.whatsappPayment as any).mobileMoneyProvider === 'orange' ? '#fed7aa' : '#fef3c7'}; color: ${(order.whatsappPayment as any).mobileMoneyProvider === 'orange' ? '#9a3412' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
                      ${(order.whatsappPayment as any).mobileMoneyProvider === 'orange' ? '🟠 Orange Money' : '🟡 MTN Mobile Money'}
                    </span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">Date upload</td>
                  <td style="padding: 12px 0; text-align: right; color: #1f2937;">
                    ${new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </td>
                </tr>
              </table>

              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  🔍 Voir et Valider la Preuve
                </a>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>💡 Rappel :</strong> Vérifiez que la capture d'écran/reçu contient :
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                  <li>Le montant exact (${order.total.toLocaleString('fr-FR')} FCFA)</li>
                  <li>La date et l'heure de transaction</li>
                  <li>Le numéro de transaction ou référence</li>
                  <li>Une image claire et lisible</li>
                </ul>
              </div>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Cet email a été envoyé automatiquement.<br>
                <strong>AGRIPOINT SERVICES</strong> | Système de Gestion des Commandes
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Erreur envoi email admin:', emailError);
      // Ne pas bloquer le processus si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Reçu uploadé avec succès',
      order: order,
      receiptUrl: publicUrl,
    });
  } catch (error) {
    console.error('Erreur upload reçu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}

// GET - Récupérer le reçu d'une commande
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

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

    // Déterminer les infos selon la méthode de paiement
    const receiptInfo = order.paymentMethod === 'whatsapp' 
      ? {
          hasReceipt: !!order.whatsappPayment?.screenshotUrl,
          receiptUrl: order.whatsappPayment?.screenshotUrl,
          uploadedAt: order.whatsappPayment?.screenshotUploadedAt,
          validated: !!order.whatsappPayment?.validatedAt,
          validatedAt: order.whatsappPayment?.validatedAt,
        }
      : {
          hasReceipt: !!order.campostPayment?.receiptImage,
          receiptUrl: order.campostPayment?.receiptImage,
          uploadedAt: order.campostPayment?.receiptUploadedAt,
          validated: !!order.campostPayment?.validatedAt,
          validatedAt: order.campostPayment?.validatedAt,
        };

    return NextResponse.json(receiptInfo);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
