import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import { verifyAccessToken } from '@/lib/auth';
import { ActivityLog } from '@/models/Security';

// POST - Dupliquer un formulaire
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification du token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const payload = verifyAccessToken(token);
    if (!payload || !['admin', 'editor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('id');
    
    if (!formId) {
      return NextResponse.json(
        { error: 'ID du formulaire requis' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { newSlug, newName } = body;
    
    if (!newSlug) {
      return NextResponse.json(
        { error: 'Le nouveau slug est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que le formulaire source existe
    const originalForm = await Form.findById(formId);
    
    if (!originalForm) {
      return NextResponse.json(
        { error: 'Formulaire source non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que le nouveau slug est unique
    const existingForm = await Form.findOne({ slug: newSlug });
    
    if (existingForm) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    // Dupliquer le formulaire manuellement
    const duplicatedForm = new Form({
      name: newName || `${originalForm.name} (copie)`,
      slug: newSlug,
      description: originalForm.description,
      fields: originalForm.fields,
      settings: originalForm.settings,
      isActive: false, // Désactivé par défaut pour la copie
      createdBy: payload.userId,
    });
    await duplicatedForm.save();
    
    // Log d'audit
    await ActivityLog.create({
      user: payload.userId,
      action: 'duplicate',
      category: 'form',
      details: {
        originalFormId: formId,
        originalFormName: originalForm.name,
        newFormName: duplicatedForm.name,
      },
    });
    
    return NextResponse.json(
      {
        form: duplicatedForm,
        message: 'Formulaire dupliqué avec succès',
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Erreur POST /api/admin/forms/duplicate:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
