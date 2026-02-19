import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import Form from '@/models/Form';
import FormSubmission from '@/models/FormSubmission';
import { ActivityLog } from '@/models/Security';

// GET - Liste des formulaires avec stats
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const id = searchParams.get('id');
    
    // Si ID spécifique
    if (id) {
      const form = await Form.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
      
      if (!form) {
        return NextResponse.json(
          { error: 'Formulaire non trouvé' },
          { status: 404 }
        );
      }
      
      // Stats des soumissions
      const submissionCount = await FormSubmission.countDocuments({ formId: id });
      const submissionStats = {
        total: submissionCount,
        pending: await FormSubmission.countDocuments({ formId: id, status: 'pending' }),
        processed: await FormSubmission.countDocuments({ formId: id, status: 'processed' }),
      };
      
      return NextResponse.json({
        form: {
          ...form.toObject(),
          submissionStats,
        },
      });
    }
    
    // Construction du filtre
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Récupération des formulaires
    const forms = await Form.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    const total = await Form.countDocuments(filter);
    
    // Statistiques globales
    const stats = await Form.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
          },
          drafts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] },
          },
          archived: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] },
          },
          totalSubmissions: { $sum: '$stats.totalSubmissions' },
          totalViews: { $sum: '$stats.views' },
        },
      },
    ]);
    
    return NextResponse.json({
      forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        total: 0,
        published: 0,
        drafts: 0,
        closed: 0,
        archived: 0,
        totalSubmissions: 0,
        totalViews: 0,
      },
    });
    
  } catch (error: any) {
    console.error('Erreur GET /api/admin/forms:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un formulaire
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
    
    const body = await request.json();
    const { name, description, fields, settings, status } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }
    
    // Générer le slug
    let slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Vérifier unicité du slug
    let existingForm = await Form.findOne({ slug });
    let counter = 1;
    while (existingForm) {
      slug = `${slug}-${counter}`;
      existingForm = await Form.findOne({ slug });
      counter++;
    }
    
    // Générer IDs pour les champs
    const processedFields = (fields || []).map((field: any, index: number) => ({
      ...field,
      id: field.id || `field_${Date.now()}_${index}`,
      order: field.order !== undefined ? field.order : index,
      // Générer nom technique si manquant
      name: field.name || field.label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_'),
    }));
    
    // Créer le formulaire
    const form = new Form({
      name,
      slug,
      description,
      fields: processedFields,
      settings: settings || {},
      status: status || 'draft',
      createdBy: payload.userId,
      stats: {
        totalSubmissions: 0,
        views: 0,
      },
    });
    
    await form.save();
    
    // Log d'audit
    await ActivityLog.create({
      user: payload.userId,
      action: 'create',
      category: 'form',
      details: {
        resource: 'form',
        resourceId: form._id.toString(),
        formName: name,
        fieldsCount: processedFields.length,
      },
    });
    
    return NextResponse.json({ form }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur POST /api/admin/forms:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier un formulaire
export async function PATCH(request: NextRequest) {
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
    
    // Trouver le formulaire
    const form = await Form.findById(formId);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }
    
    // Traiter les champs si modifiés
    if (body.fields) {
      body.fields = body.fields.map((field: any, index: number) => ({
        ...field,
        id: field.id || `field_${Date.now()}_${index}`,
        order: field.order !== undefined ? field.order : index,
        name: field.name || field.label
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_'),
      }));
    }
    
    // Mettre à jour
    Object.assign(form, body);
    form.updatedBy = payload.userId;
    
    await form.save();
    
    // Log d'audit
    const updatedFields = Object.keys(body);
    await ActivityLog.create({
      user: payload.userId,
      action: 'update',
      category: 'form',
      details: {
        resource: 'form',
        resourceId: form._id.toString(),
        updatedFields,
        fieldsCount: form.fields.length,
      },
    });
    
    return NextResponse.json({ form });
    
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/forms:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un formulaire
export async function DELETE(request: NextRequest) {
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé - Admin uniquement' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('id');
    const deleteSubmissions = searchParams.get('deleteSubmissions') === 'true';
    
    if (!formId) {
      return NextResponse.json(
        { error: 'ID du formulaire requis' },
        { status: 400 }
      );
    }
    
    const form = await Form.findById(formId);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }
    
    // Statistiques avant suppression
    const submissionsCount = await FormSubmission.countDocuments({ formId });
    
    // Supprimer les soumissions si demandé
    if (deleteSubmissions) {
      await FormSubmission.deleteMany({ formId });
    }
    
    // Supprimer le formulaire
    await form.deleteOne();
    
    // Log d'audit
    await ActivityLog.create({
      user: payload.userId,
      action: 'delete',
      category: 'form',
      details: {
        resource: 'form',
        resourceId: formId,
        formName: form.name,
        submissionsCount,
        submissionsDeleted: deleteSubmissions,
      },
    });
    
    return NextResponse.json({
      message: 'Formulaire supprimé avec succès',
      submissionsCount,
      submissionsDeleted: deleteSubmissions,
    });
    
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/forms:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
