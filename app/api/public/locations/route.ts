import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Location from '@/models/Location';

// GET - Liste publique des locations
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    
    // Filtre de distance (optionnel)
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '50'); // km

    // Filtres de base - uniquement locations publiques et actives
    const filter: any = {
      isPublic: true,
      isActive: true,
    };

    if (type) filter.type = type;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    let locations = await Location.find(filter)
      .select('-createdBy -updatedBy -__v')
      .sort({ verified: -1, createdAt: -1 })
      .lean();

    // Filtre par distance si coordonnées fournies
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      locations = locations
        .map((loc: any) => {
          const distance = calculateDistance(
            userLat,
            userLng,
            loc.coordinates.latitude,
            loc.coordinates.longitude
          );
          return { ...loc, distance };
        })
        .filter((loc: any) => loc.distance <= radius)
        .sort((a: any, b: any) => a.distance - b.distance);
    }

    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error('Erreur GET public locations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des locations' },
      { status: 500 }
    );
  }
}

// Calcul de distance (formule de Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
