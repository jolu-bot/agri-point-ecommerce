import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Distributor from '@/models/Distributor';

// GET /api/distributors/[id] - Récupérer un distributeur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const distributor = await Distributor.findById(id);

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributeur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      distributor,
    });
  } catch (error) {
    console.error('Erreur récupération distributeur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/distributors/[id] - Mettre à jour un distributeur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const distributor = await Distributor.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributeur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Distributeur mis à jour',
      distributor,
    });
  } catch (error) {
    console.error('Erreur mise à jour distributeur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/distributors/[id] - Supprimer un distributeur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const distributor = await Distributor.findByIdAndDelete(id);

    if (!distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributeur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Distributeur supprimé',
    });
  } catch (error) {
    console.error('Erreur suppression distributeur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
