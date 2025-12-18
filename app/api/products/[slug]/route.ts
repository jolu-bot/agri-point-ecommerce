import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const product = await Product.findOne({
      slug: params.slug,
      isActive: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Incrémenter les vues
    await Product.findByIdAndUpdate(product._id, {
      $inc: { views: 1 },
    });

    // Récupérer des produits similaires
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .lean();

    return NextResponse.json({
      product,
      relatedProducts,
    });

  } catch (error: any) {
    console.error('Erreur récupération produit:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
