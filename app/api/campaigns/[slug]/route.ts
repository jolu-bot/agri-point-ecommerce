import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Campaign } from '@/models/Campaign';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    
    const { slug } = await params;

    const campaign = await Campaign.findOne({ slug }).populate('products');

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur lors du chargement de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}
