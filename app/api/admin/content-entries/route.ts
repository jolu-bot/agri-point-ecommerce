import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContentType from '@/models/ContentType';
import ContentEntry from '@/models/ContentEntry';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-logger';

// GET /api/admin/content-entries - Liste les entrées d'un content type
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await verifyAccessToken(token);
    if (!user || !['admin', 'editor', 'viewer'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const contentTypeSlug = searchParams.get('contentType');
    const status = searchParams.get('status');
    const locale = searchParams.get('locale');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!contentTypeSlug) {
      return NextResponse.json({ error: 'contentType manquant' }, { status: 400 });
    }

    // Récupérer le content type pour vérifier permissions
    const contentType = await ContentType.findOne({ slug: contentTypeSlug });
    if (!contentType) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    // Vérifier permissions de lecture
    if (!contentType.permissions.read.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé pour ce content type' }, { status: 403 });
    }

    // Build query
    const query: any = { 
      contentTypeSlug,
      deletedAt: { $exists: false }, // Exclure soft-deleted par défaut
    };

    if (status) {
      query.status = status;
    }

    if (locale) {
      query.locale = locale;
    }

    // Recherche full-text si fournie
    if (search) {
      // Recherche dans les champs searchables définis dans le content type
      if (contentType.display.searchFields.length > 0) {
        query.$or = contentType.display.searchFields.map((field: string) => ({
          [`data.${field}`]: { $regex: search, $options: 'i' },
        }));
      } else {
        // Fallback: recherche dans tous les champs texte
        query.$text = { $search: search };
      }
    }

    // Tri
    const sortField = contentType.display.defaultSort.field;
    const sortOrder = contentType.display.defaultSort.order === 'asc' ? 1 : -1;
    const sort: any = {};
    
    if (sortField.startsWith('data.')) {
      sort[sortField] = sortOrder;
    } else {
      sort[sortField] = sortOrder;
    }

    // Exécuter la requête
    const entries = await ContentEntry.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    const total = await ContentEntry.countDocuments(query);

    // Stats
    const stats = await ContentEntry.aggregate([
      { $match: { contentTypeSlug, deletedAt: { $exists: false } } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          byLocale: [
            { $group: { _id: '$locale', count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    return NextResponse.json({
      entries,
      contentType: {
        name: contentType.name,
        slug: contentType.slug,
        fields: contentType.fields,
        display: contentType.display,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats[0].byStatus,
        byLocale: stats[0].byLocale,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/content-entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/content-entries - Créer une nouvelle entrée
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { contentTypeSlug, data, status, seo, locale } = body;

    if (!contentTypeSlug || !data) {
      return NextResponse.json({ error: 'contentTypeSlug et data requis' }, { status: 400 });
    }

    // Récupérer le content type
    const contentType = await ContentType.findOne({ slug: contentTypeSlug });
    if (!contentType) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    // Vérifier permissions de création
    if (!contentType.permissions.create.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé pour créer ce type de contenu' }, { status: 403 });
    }

    // Valider les données selon les champs du content type
    const validationErrors = await validateEntryData(data, contentType);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Erreurs de validation',
        validationErrors,
      }, { status: 400 });
    }

    // Créer l'entrée
    const entry = await ContentEntry.create({
      contentType: contentType._id,
      contentTypeSlug,
      data,
      status: status || 'draft',
      seo,
      locale: locale || 'fr',
      createdBy: user.userId,
    });

    // Incrémenter le compteur d'entrées
    await ContentType.findByIdAndUpdate(contentType._id, {
      $inc: { entriesCount: 1 },
    });

    // Audit log
    const titleField = contentType.display.titleField;
    const title = data[titleField] || 'Sans titre';
    
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'create',
      resource: 'content-entry',
      resourceId: entry._id.toString(),
      description: `Entrée créée: ${title} (${contentType.name})`,
      severity: 'info',
      metadata: {
        contentType: contentTypeSlug,
        status: entry.status,
      },
      request,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/admin/content-entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/content-entries - Mettre à jour une entrée
export async function PATCH(request: NextRequest) {
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
    const id = searchParams.get('id');
    const createVersion = searchParams.get('createVersion') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const body = await request.json();

    // Récupérer l'entrée existante
    const entry = await ContentEntry.findById(id);
    if (!entry) {
      return NextResponse.json({ error: 'Entrée introuvable' }, { status: 404 });
    }

    // Récupérer le content type
    const contentType = await ContentType.findById(entry.contentType);
    if (!contentType) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    // Vérifier permissions de modification
    if (!contentType.permissions.update.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé pour modifier ce type de contenu' }, { status: 403 });
    }

    // Si versioning activé et createVersion=true, créer une version
    if (contentType.settings.enableVersioning && createVersion) {
      entry.createVersion(user.userId, body.versionComment);
    }

    // Valider les nouvelles données si elles sont fournies
    if (body.data) {
      const validationErrors = await validateEntryData(body.data, contentType);
      if (validationErrors.length > 0) {
        return NextResponse.json({
          error: 'Erreurs de validation',
          validationErrors,
        }, { status: 400 });
      }
    }

    // Mettre à jour
    Object.assign(entry, {
      ...body,
      updatedBy: user.userId,
    });

    await entry.save();

    // Audit log
    const titleField = contentType.display.titleField;
    const title = entry.data[titleField] || 'Sans titre';
    
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'update',
      resource: 'content-entry',
      resourceId: id,
      description: `Entrée mise à jour: ${title} (${contentType.name})`,
      severity: 'info',
      metadata: {
        contentType: contentType.slug,
        versionCreated: createVersion,
      },
      request,
    });

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/content-entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/content-entries - Supprimer une entrée
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const entry = await ContentEntry.findById(id);
    if (!entry) {
      return NextResponse.json({ error: 'Entrée introuvable' }, { status: 404 });
    }

    // Récupérer le content type
    const contentType = await ContentType.findById(entry.contentType);
    if (!contentType) {
      return NextResponse.json({ error: 'Content Type introuvable' }, { status: 404 });
    }

    // Vérifier permissions de suppression
    if (!contentType.permissions.delete.includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé pour supprimer ce type de contenu' }, { status: 403 });
    }

    const titleField = contentType.display.titleField;
    const title = entry.data[titleField] || 'Sans titre';

    if (permanent || !contentType.settings.softDelete) {
      // Suppression permanente
      await ContentEntry.findByIdAndDelete(id);
      await ContentType.findByIdAndUpdate(contentType._id, {
        $inc: { entriesCount: -1 },
      });
    } else {
      // Soft delete
      entry.softDelete(user.userId);
      await entry.save();
    }

    // Audit log
    await createAuditLog({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'delete',
      resource: 'content-entry',
      resourceId: id,
      description: `Entrée ${permanent ? 'supprimée définitivement' : 'archivée'}: ${title} (${contentType.name})`,
      severity: permanent ? 'warning' : 'info',
      metadata: {
        contentType: contentType.slug,
        permanent,
      },
      tags: ['delete', 'content-entry'],
      request,
    });

    return NextResponse.json({
      message: permanent ? 'Entrée supprimée définitivement' : 'Entrée archivée',
    });
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/content-entries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fonction helper pour valider les données d'une entrée
async function validateEntryData(data: Record<string, any>, contentType: any): Promise<string[]> {
  const errors: string[] = [];

  for (const field of contentType.fields) {
    const value = data[field.slug];

    // Vérifier required
    if (field.validation.required && (value === undefined || value === null || value === '')) {
      errors.push(`Le champ "${field.name}" est requis`);
      continue;
    }

    // Si pas de valeur et pas required, skip
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Validation selon le type
    switch (field.type) {
      case 'text':
      case 'richText':
      case 'email':
      case 'url':
        if (typeof value !== 'string') {
          errors.push(`Le champ "${field.name}" doit être une chaîne de caractères`);
        } else {
          // Min/Max length
          if (field.validation.min && value.length < field.validation.min) {
            errors.push(`Le champ "${field.name}" doit contenir au moins ${field.validation.min} caractères`);
          }
          if (field.validation.max && value.length > field.validation.max) {
            errors.push(`Le champ "${field.name}" ne doit pas dépasser ${field.validation.max} caractères`);
          }
          
          // Pattern
          if (field.validation.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(value)) {
              errors.push(field.validation.message || `Le champ "${field.name}" ne respecte pas le format attendu`);
            }
          }
          
          // Email validation
          if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`Le champ "${field.name}" doit être une adresse email valide`);
          }
          
          // URL validation
          if (field.type === 'url') {
            try {
              new URL(value);
            } catch {
              errors.push(`Le champ "${field.name}" doit être une URL valide`);
            }
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Le champ "${field.name}" doit être un nombre`);
        } else {
          if (field.validation.min !== undefined && value < field.validation.min) {
            errors.push(`Le champ "${field.name}" doit être supérieur ou égal à ${field.validation.min}`);
          }
          if (field.validation.max !== undefined && value > field.validation.max) {
            errors.push(`Le champ "${field.name}" ne doit pas dépasser ${field.validation.max}`);
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Le champ "${field.name}" doit être un booléen`);
        }
        break;

      case 'date':
      case 'datetime':
        if (!(value instanceof Date || !isNaN(Date.parse(value)))) {
          errors.push(`Le champ "${field.name}" doit être une date valide`);
        }
        break;

      case 'select':
        if (field.options?.choices) {
          const validValues = field.options.choices.map((c: any) => c.value);
          if (!validValues.includes(value)) {
            errors.push(`Le champ "${field.name}" doit être l'une des valeurs: ${validValues.join(', ')}`);
          }
        }
        break;

      case 'multiSelect':
      case 'tags':
        if (!Array.isArray(value)) {
          errors.push(`Le champ "${field.name}" doit être un tableau`);
        }
        break;

      case 'media':
        if (field.options?.multiple) {
          if (!Array.isArray(value)) {
            errors.push(`Le champ "${field.name}" doit être un tableau`);
          } else if (field.options.maxFiles && value.length > field.options.maxFiles) {
            errors.push(`Le champ "${field.name}" ne peut contenir plus de ${field.options.maxFiles} fichiers`);
          }
        }
        break;
    }
  }

  return errors;
}
