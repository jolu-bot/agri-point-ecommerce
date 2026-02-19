import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContentType from '@/models/ContentType';
import ContentEntry from '@/models/ContentEntry';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-logger';

// GET /api/admin/content-types - Liste tous les content types
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const includeSystem = searchParams.get('includeSystem') === 'true';

    // Build query
    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (!includeSystem) {
      query.isSystem = false;
    }

    const contentTypes = await ContentType.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    // Stats globales
    const stats = {
      total: contentTypes.length,
      active: contentTypes.filter((ct: any) => ct.isActive).length,
      system: contentTypes.filter((ct: any) => ct.isSystem).length,
      totalEntries: contentTypes.reduce((sum: number, ct: any) => sum + ct.entriesCount, 0),
    };

    return NextResponse.json({
      contentTypes,
      stats,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/content-types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/content-types - Créer un nouveau content type
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();

    // Générer slug si non fourni
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Générer pluralName si non fourni
    if (!body.pluralName) {
      body.pluralName = body.name + 's';
    }

    // Assigner IDs aux champs si non fournis
    if (body.fields && Array.isArray(body.fields)) {
      body.fields = body.fields.map((field: any, index: number) => ({
        ...field,
        id: field.id || `field_${Date.now()}_${index}`,
        slug: field.slug || field.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, ''),
      }));
    }

    // Ajouter createdBy
    body.createdBy = user.userId;

    const contentType = await ContentType.create(body);

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'create',
      resource: 'content-type',
      resourceId: contentType._id.toString(),
      description: `Content Type créé: ${contentType.name}`,
      severity: 'info',
      metadata: {
        slug: contentType.slug,
        fieldsCount: contentType.fields.length,
      },
      request,
    });

    return NextResponse.json({ contentType }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/content-types:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Un content type avec ce slug existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/content-types - Mettre à jour un content type
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const body = await request.json();

    // Vérifier si system
    const existing = await ContentType.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    if (existing.isSystem && body.isSystem === false) {
      return NextResponse.json(
        { error: 'Les content types système ne peuvent pas être modifiés en non-système' },
        { status: 400 }
      );
    }

    // Assigner IDs aux nouveaux champs
    if (body.fields && Array.isArray(body.fields)) {
      body.fields = body.fields.map((field: any, index: number) => ({
        ...field,
        id: field.id || `field_${Date.now()}_${index}`,
      }));
    }

    body.updatedBy = user.userId;

    const contentType = await ContentType.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'update',
      resource: 'content-type',
      resourceId: id,
      description: `Content Type mis à jour: ${contentType?.name}`,
      severity: 'info',
      request,
    });

    return NextResponse.json({ contentType });
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/content-types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/content-types - Supprimer un content type
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const contentType = await ContentType.findById(id);

    if (!contentType) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    // Vérifier si system
    if (contentType.isSystem) {
      return NextResponse.json(
        { error: 'Les content types système ne peuvent pas être supprimés' },
        { status: 400 }
      );
    }

    // Vérifier s'il y a des entrées
    if (contentType.entriesCount > 0 && !force) {
      return NextResponse.json(
        { 
          error: 'Ce content type contient des entrées',
          entriesCount: contentType.entriesCount,
          hint: 'Utilisez force=true pour supprimer quand même (supprimera toutes les entrées)',
        },
        { status: 400 }
      );
    }

    // Si force, supprimer toutes les entrées
    if (force) {
      await ContentEntry.deleteMany({ contentType: id });
    }

    await ContentType.findByIdAndDelete(id);

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'delete',
      resource: 'content-type',
      resourceId: id,
      description: `Content Type supprimé: ${contentType.name}`,
      severity: 'warning',
      metadata: {
        slug: contentType.slug,
        entriesDeleted: force ? contentType.entriesCount : 0,
      },
      tags: ['delete', 'content-type'],
      request,
    });

    return NextResponse.json({ 
      message: 'Content Type supprimé avec succès',
      entriesDeleted: force ? contentType.entriesCount : 0,
    });
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/content-types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
