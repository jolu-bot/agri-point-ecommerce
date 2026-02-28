import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Distributor from '@/models/Distributor';

// GET /api/distributors - Récupérer tous les distributeurs actifs
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Filtres optionnels
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const region = searchParams.get('region');

    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (region) filter.region = new RegExp(region, 'i');

    const distributors = await Distributor.find(filter)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: distributors.length,
      distributors,
    });
  } catch (error) {
    console.error('Erreur récupération distributeurs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/distributors - Créer un distributeur (admin)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérification authentification admin (optionnel)
    const token = request.headers.get('authorization')?.split(' ')[1];
    // TODO: Vérifier que token a rôle admin

    const body = await request.json();
    const {
      name,
      category,
      address,
      city,
      region,
      phone,
      email,
      coordinates,
      businessHours,
      description,
      logo,
      products,
    } = body;

    // Validation
    if (!name || !address || !city || !region || !phone || !email || !coordinates) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Créer distributeur
    const distributor = await Distributor.create({
      name,
      category: category || 'retailer',
      address,
      city,
      region,
      phone,
      email,
      coordinates,
      businessHours: businessHours || 'Lun-Sam: 7h-18h',
      description: description || '',
      logo: logo || null,
      products: products || [],
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Distributeur créé avec succès',
        distributor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création distributeur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
