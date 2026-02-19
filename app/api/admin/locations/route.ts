import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Location from '@/models/Location';

// GET - Liste des locations
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('public');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filtres
    const filter: any = {};
    if (type) filter.type = type;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (isPublic !== null) filter.isPublic = isPublic === 'true';
    if (verified !== null) filter.verified = verified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const locations = await Location.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Location.countDocuments(filter);

    // Stats
    const stats = {
      total: await Location.countDocuments(),
      public: await Location.countDocuments({ isPublic: true }),
      verified: await Location.countDocuments({ verified: true }),
      byType: {
        farm: await Location.countDocuments({ type: 'farm' }),
        market: await Location.countDocuments({ type: 'market' }),
        distribution: await Location.countDocuments({ type: 'distribution' }),
        event: await Location.countDocuments({ type: 'event' }),
        other: await Location.countDocuments({ type: 'other' }),
      },
    };

    return NextResponse.json({
      locations,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Erreur GET locations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des locations' },
      { status: 500 }
    );
  }
}

// POST - Créer une location
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validation
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: 'Nom et type requis' },
        { status: 400 }
      );
    }

    if (!data.coordinates || typeof data.coordinates.latitude !== 'number' || typeof data.coordinates.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Coordonnées valides requises' },
        { status: 400 }
      );
    }

    if (!data.address || !data.address.city) {
      return NextResponse.json(
        { error: 'Ville requise' },
        { status: 400 }
      );
    }

    const location = await Location.create({
      ...data,
      createdBy: session.user.id,
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST location:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la location' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une location
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const location = await Location.findById(id);
    if (!location) {
      return NextResponse.json({ error: 'Location non trouvée' }, { status: 404 });
    }

    // Mise à jour
    Object.assign(location, {
      ...data,
      updatedBy: session.user.id,
    });

    await location.save();

    return NextResponse.json({ location });
  } catch (error: any) {
    console.error('Erreur PATCH location:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la location' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une location
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      return NextResponse.json({ error: 'Location non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Location supprimée' });
  } catch (error: any) {
    console.error('Erreur DELETE location:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la location' },
      { status: 500 }
    );
  }
}
