import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Campaign } from '@/models/Campaign';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Chercher la campagne de Mars 2026
    const campaign = await Campaign.findOne({
      slug: 'engrais-mars-2026'
    }).populate('products');

    if (!campaign) {
      // Ou retourner une campagne par défaut
      return NextResponse.json(
        { error: 'Campagne non disponible pour le moment' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}
