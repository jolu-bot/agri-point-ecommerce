import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Page from '@/models/Page';
import { createAuditLog } from '@/models/Security';

// POST - Dupliquer une page
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const user = decoded;
    
    // Vérifier le rôle
    if (!['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const searchParams = req.nextUrl.searchParams;
    const pageId = searchParams.get('id');
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'ID de la page requis' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { newSlug, newTitle } = body;
    
    if (!newSlug) {
      return NextResponse.json(
        { error: 'Le slug de la nouvelle page est requis' },
        { status: 400 }
      );
    }
    
    // Trouver la page originale
    const originalPage = await Page.findById(pageId);
    
    if (!originalPage) {
      return NextResponse.json(
        { error: 'Page originale non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier l'unicité du nouveau slug
    const existingPage = await Page.findOne({ slug: newSlug });
    if (existingPage) {
      return NextResponse.json(
        { error: 'Une page avec ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    // Dupliquer la page
    const duplicatedPage = await originalPage.duplicate(newSlug, newTitle);
    duplicatedPage.createdBy = user.id as any;
    await duplicatedPage.save();
    
    // Audit log
    await createAuditLog({
      action: 'duplicate',
      resource: 'page',
      resourceId: duplicatedPage._id.toString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      details: {
        originalPageId: pageId,
        originalTitle: originalPage.title,
        newTitle: duplicatedPage.title,
        newSlug: newSlug,
      },
      severity: 'info',
    });
    
    return NextResponse.json({
      page: duplicatedPage,
      message: 'Page dupliquée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error duplicating page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la duplication de la page' },
      { status: 500 }
    );
  }
}
