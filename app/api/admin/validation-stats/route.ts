import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    
    // Vérifier que l'utilisateur est admin ou manager
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer toutes les commandes avec paiement WhatsApp ou Campost
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Commandes en attente de validation (avec screenshot/reçu uploadé)
    const awaitingValidation = await Order.find({
      paymentMethod: { $in: ['whatsapp', 'campost'] },
      paymentStatus: 'awaiting_proof',
      $or: [
        { 'whatsappPayment.screenshotUrl': { $exists: true, $ne: null } },
        { 'campostPayment.receiptImage': { $exists: true, $ne: null } }
      ]
    }).select('orderNumber total paymentMethod createdAt whatsappPayment.screenshotUploadedAt campostPayment.receiptUploadedAt');

    // Commandes validées dans les 7 derniers jours
    const recentlyValidated = await Order.find({
      paymentMethod: { $in: ['whatsapp', 'campost'] },
      $or: [
        { 'whatsappPayment.validatedAt': { $gte: sevenDaysAgo } },
        { 'campostPayment.validatedAt': { $gte: sevenDaysAgo } }
      ]
    }).select('orderNumber total paymentMethod paymentStatus whatsappPayment.validatedAt whatsappPayment.screenshotUploadedAt campostPayment.validatedAt campostPayment.receiptUploadedAt');

    // Calculer les statistiques
    const stats = {
      // Nombre en attente
      awaitingCount: awaitingValidation.length,
      
      // Commandes dépassant le SLA de 2h
      overdueSLA: awaitingValidation.filter(order => {
        const uploadDate = order.paymentMethod === 'whatsapp' 
          ? order.whatsappPayment?.screenshotUploadedAt 
          : order.campostPayment?.receiptUploadedAt;
        return uploadDate && new Date(uploadDate) < twoHoursAgo;
      }).length,

      // Commandes des dernières 24h
      last24h: awaitingValidation.filter(order => {
        const uploadDate = order.paymentMethod === 'whatsapp' 
          ? order.whatsappPayment?.screenshotUploadedAt 
          : order.campostPayment?.receiptUploadedAt;
        return uploadDate && new Date(uploadDate) >= oneDayAgo;
      }).length,

      // Statistiques 7 derniers jours
      last7Days: {
        total: recentlyValidated.length,
        approved: recentlyValidated.filter(o => o.paymentStatus === 'paid').length,
        rejected: recentlyValidated.filter(o => o.paymentStatus === 'failed').length,
      },

      // Calcul du délai moyen de validation (en heures)
      averageValidationTime: (() => {
        const validatedWithTimes = recentlyValidated.filter(order => {
          const uploadDate = order.paymentMethod === 'whatsapp' 
            ? order.whatsappPayment?.screenshotUploadedAt 
            : order.campostPayment?.receiptUploadedAt;
          const validationDate = order.paymentMethod === 'whatsapp' 
            ? order.whatsappPayment?.validatedAt 
            : order.campostPayment?.validatedAt;
          return uploadDate && validationDate;
        });

        if (validatedWithTimes.length === 0) return 0;

        const totalMinutes = validatedWithTimes.reduce((sum, order) => {
          const uploadDate = order.paymentMethod === 'whatsapp' 
            ? new Date(order.whatsappPayment!.screenshotUploadedAt!)
            : new Date(order.campostPayment!.receiptUploadedAt!);
          const validationDate = order.paymentMethod === 'whatsapp' 
            ? new Date(order.whatsappPayment!.validatedAt!)
            : new Date(order.campostPayment!.validatedAt!);
          
          const diffMs = validationDate.getTime() - uploadDate.getTime();
          return sum + (diffMs / (1000 * 60)); // Convertir en minutes
        }, 0);

        return Math.round((totalMinutes / validatedWithTimes.length) / 60 * 10) / 10; // Heures avec 1 décimale
      })(),

      // Taux d'approbation (%)
      approvalRate: (() => {
        const total = recentlyValidated.length;
        if (total === 0) return 0;
        const approved = recentlyValidated.filter(o => o.paymentStatus === 'paid').length;
        return Math.round((approved / total) * 100);
      })(),

      // Répartition par méthode
      byMethod: {
        whatsapp: awaitingValidation.filter(o => o.paymentMethod === 'whatsapp').length,
        campost: awaitingValidation.filter(o => o.paymentMethod === 'campost').length,
      }
    };

    // Liste des commandes en attente avec plus de détails
    const awaitingDetails = awaitingValidation.map(order => {
      const uploadDate = order.paymentMethod === 'whatsapp' 
        ? order.whatsappPayment?.screenshotUploadedAt 
        : order.campostPayment?.receiptUploadedAt;
      
      const hoursAgo = uploadDate 
        ? Math.round((now.getTime() - new Date(uploadDate).getTime()) / (1000 * 60 * 60) * 10) / 10
        : 0;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        uploadedAt: uploadDate,
        hoursAgo,
        isOverdue: hoursAgo > 2,
      };
    }).sort((a, b) => b.hoursAgo - a.hoursAgo); // Plus ancien en premier

    return NextResponse.json({
      stats,
      awaitingOrders: awaitingDetails,
    });

  } catch (error) {
    console.error('Erreur récupération stats validation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
