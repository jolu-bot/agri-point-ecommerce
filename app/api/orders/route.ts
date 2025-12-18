import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

const verifyToken = async (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_ici') as { userId: string; role: string };
  } catch {
    return null;
  }
};

// GET /api/orders - Récupérer les commandes de l'utilisateur
export async function GET(request: NextRequest) {
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

    const orders = await Order.find({ user: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      items,
      subtotal,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      promoCode,
    } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
      return NextResponse.json(
        { error: 'Adresse de livraison incomplète' },
        { status: 400 }
      );
    }

    // Vérifier la disponibilité des produits
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productName} non trouvé` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.productName}. Disponible: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    // Créer la commande
    const order = await Order.create({
      user: decoded.userId,
      items,
      subtotal,
      shipping,
      discount: promoCode ? (subtotal * (promoCode.discount / 100)) : 0,
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processing',
      status: 'pending',
    });

    // Mettre à jour le stock des produits
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Commande créée avec succès',
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
