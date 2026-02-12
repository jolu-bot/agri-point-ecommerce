import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Campaign } from '@/models/Campaign';
import Order from '@/models/Order';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Récupérer toutes les campagnes actives
    const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });

    // Pour chaque campagne, récupérer les commandes associées
    const campaignsWithOrders = await Promise.all(
      campaigns.map(async (campaign) => {
        const orders = await Order.find({
          campaign: campaign._id,
        }).sort({ createdAt: -1 });

        return {
          _id: campaign._id,
          name: campaign.name,
          slug: campaign.slug,
          totalOrders: campaign.stats.totalOrders,
          totalQuantity: campaign.stats.totalQuantity,
          totalRevenue: campaign.stats.totalRevenue,
          orders: orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
            isCampaignOrder: order.isCampaignOrder,
            installmentPayment: order.installmentPayment,
            createdAt: order.createdAt,
          })),
        };
      })
    );

    return NextResponse.json(campaignsWithOrders);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}
