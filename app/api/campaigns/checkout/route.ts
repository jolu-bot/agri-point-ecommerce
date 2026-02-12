import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { Campaign } from '@/models/Campaign';
import Product from '@/models/Product';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      campaignSlug,
      eligibilityData,
      useInstallmentPayment,
    } = body;

    // Charger la campagne si elle existe
    let campaign = null;
    let installmentPayment = null;

    if (campaignSlug) {
      campaign = await Campaign.findOne({ slug: campaignSlug });

      if (campaign && useInstallmentPayment && campaign.paymentScheme.enabled) {
        // Calculer les montants
        let subtotal = 0;
        for (const item of items) {
          const product = await Product.findById(item.product);
          if (product) {
            subtotal += (item.quantity * item.price);
          }
        }

        const totalAmount = subtotal; // Avant taxes/shipping
        const firstAmount = Math.round(totalAmount * (campaign.paymentScheme.firstPercentage / 100));
        const secondAmount = totalAmount - firstAmount;

        // Créer un délai de paiement (30 jours après récolte, ex: 60 jours après la commande)
        const secondPaymentDueDate = new Date();
        secondPaymentDueDate.setDate(secondPaymentDueDate.getDate() + 60);

        installmentPayment = {
          enabled: true,
          firstAmount,
          secondAmount,
          firstPaymentStatus: 'pending',
          secondPaymentStatus: 'pending',
          secondPaymentDueDate,
        };
      }
    }

    // Calculer les totaux
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.total;
    }

    const tax = Math.round(subtotal * 0.025); // 2.5% TVA Cameroun
    const shipping = subtotal > 50000 ? 0 : 5000; // Livraison gratuite si > 50K FCFA
    const total = subtotal + tax + shipping;

    // Créer la commande
    const order = new Order({
      orderNumber: `CMD-${Date.now()}-${uuidv4().substring(0, 8)}`,
      user: userId,
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: installmentPayment ? 'pending' : 'pending',
      
      // Données de campagne
      campaign: campaign?._id,
      isCampaignOrder: !!campaign,
      
      // Éligibilité
      campaignEligibility: campaign ? {
        isEligible: true,
        cooperativeMember: eligibilityData?.isMember || false,
        mutualInsuranceValid: eligibilityData?.hasInsurance || false,
        insuranceProvider: eligibilityData?.insuranceProvider,
        cooperativeEmail: eligibilityData?.cooperativeEmail,
      } : undefined,
      
      // Paiement échelonné
      installmentPayment,
    });

    await order.save();

    // Mettre à jour les stats de la campagne
    if (campaign) {
      campaign.stats.totalOrders += 1;
      campaign.stats.totalQuantity += items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      campaign.stats.totalRevenue += total;
      await campaign.save();
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        number: order.orderNumber,
        total: order.total,
        status: order.status,
        installmentPayment: installmentPayment ? {
          firstAmount: installmentPayment.firstAmount,
          secondAmount: installmentPayment.secondAmount,
          secondPaymentDueDate: installmentPayment.secondPaymentDueDate,
        } : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
