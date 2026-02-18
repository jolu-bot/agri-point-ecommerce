import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
    const order = await Order.findById(orderId);
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

    // Mettre à jour la commande
    const publicUrl = `/receipts/${fileName}`;
    order.campostPayment = {
      accountNumber: order.campostPayment?.accountNumber || 'XXXX-XXXX-XXXX',
      accountName: order.campostPayment?.accountName || 'Agri Point Services',
      ...order.campostPayment,
      receiptImage: publicUrl,
      receiptUploadedAt: new Date(),
    };
    order.paymentStatus = 'awaiting_proof';
    order.status = 'awaiting_payment';
    await order.save();

    // TODO: Envoyer notification à l'admin
    // sendAdminNotification(order);

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

    return NextResponse.json({
      hasReceipt: !!order.campostPayment?.receiptImage,
      receiptUrl: order.campostPayment?.receiptImage,
      uploadedAt: order.campostPayment?.receiptUploadedAt,
      validated: !!order.campostPayment?.validatedAt,
      validatedAt: order.campostPayment?.validatedAt,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
