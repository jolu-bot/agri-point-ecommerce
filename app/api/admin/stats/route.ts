import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    
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

    await dbConnect();

    // Vérifier les permissions admin
    const user = await User.findById(decoded.userId);
    
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Calculer les statistiques
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total commandes et revenu
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    // Commandes ce mois
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Commandes le mois dernier
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
    });

    // Revenu ce mois
    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Revenu le mois dernier
    const revenueLastMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
          status: 'delivered',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Produits
    const totalProducts = await Product.countDocuments();
    const productsThisMonth = await Product.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const productsLastMonth = await Product.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
    });

    // Utilisateurs
    const totalUsers = await User.countDocuments();
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
    });

    // Calculer les pourcentages de croissance
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalProducts,
      totalUsers,
      revenueGrowth: calculateGrowth(
        revenueThisMonth[0]?.total || 0,
        revenueLastMonth[0]?.total || 0
      ),
      ordersGrowth: calculateGrowth(ordersThisMonth, ordersLastMonth),
      productsGrowth: calculateGrowth(productsThisMonth, productsLastMonth),
      usersGrowth: calculateGrowth(usersThisMonth, usersLastMonth),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur stats admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
