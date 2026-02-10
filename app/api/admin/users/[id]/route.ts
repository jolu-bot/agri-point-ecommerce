import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';

// PUT - Mettre à jour un utilisateur
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();

    // Ne pas permettre la modification du mot de passe via cette route
    delete body.password;

    const paramsObj = await context.params;

    const user = await User.findByIdAndUpdate(
      paramsObj.id,
      body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Erreur PUT /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const paramsObj = await context.params;
    const user = await User.findByIdAndDelete(paramsObj.id);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
