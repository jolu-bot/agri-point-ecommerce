import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import FormSubmission from '@/models/FormSubmission';
import Form from '@/models/Form';
import { ActivityLog } from '@/models/Security';
import mongoose from 'mongoose';

// GET - Liste des soumissions
export async function GET(request: NextRequest) {
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
    const formId = searchParams.get('formId');
    const status = searchParams.get('status');
    const isRead = searchParams.get('isRead');
    const isStarred = searchParams.get('isStarred');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const exportFormat = searchParams.get('export');
    const submissionId = searchParams.get('id');
    
    // Si ID spécifique
    if (submissionId) {
      const submission = await FormSubmission.findById(submissionId)
        .populate('submittedBy', 'name email')
        .populate('processedBy', 'name email');
      
      if (!submission) {
        return NextResponse.json(
          { error: 'Soumission non trouvée' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ submission });
    }
    
    // Construction du filtre
    const filter: any = {};
    
    if (formId) {
      filter.formId = formId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (isRead !== null && isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (isStarred !== null && isStarred !== undefined) {
      filter.isStarred = isStarred === 'true';
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Export CSV
    if (exportFormat === 'csv' && formId) {
      const submissions = await FormSubmission.find({ formId })
        .populate('submittedBy', 'name email')
        .sort({ createdAt: -1 });
      
      // Générer le CSV
      const csvLines = ['Date,Email,Statut,Lu,Données'];
      
      submissions.forEach((sub: any) => {
        const date = new Date(sub.createdAt).toLocaleString();
        const email = sub.email || '';
        const status = sub.status || '';
        const isRead = sub.isRead ? 'Oui' : 'Non';
        const data = JSON.stringify(sub.data).replace(/"/g, '""');
        csvLines.push(`"${date}","${email}","${status}","${isRead}","${data}"`);
      });
      
      const csv = csvLines.join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="submissions-${formId}-${Date.now()}.csv"`,
        },
      });
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Récupération des soumissions
    const submissions = await FormSubmission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('submittedBy', 'name email')
      .populate('processedBy', 'name email');
    
    const total = await FormSubmission.countDocuments(filter);
    
    // Statistiques
    let stats: any = {};
    if (formId) {
      stats = {
        total: await FormSubmission.countDocuments({ formId }),
        pending: await FormSubmission.countDocuments({ formId, status: 'pending' }),
        processed: await FormSubmission.countDocuments({ formId, status: 'processed' }),
        archived: await FormSubmission.countDocuments({ formId, status: 'archived' }),
        spam: await FormSubmission.countDocuments({ formId, status: 'spam' }),
        unread: await FormSubmission.countDocuments({ formId, isRead: false }),
      };
    }
    
    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
    
  } catch (error: any) {
    console.error('Erreur GET /api/admin/form-submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier une soumission (status, notes, tags, etc.)
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
    const submissionId = searchParams.get('id');
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'ID de soumission requis' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { status, notes, tags, isRead, isStarred } = body;
    
    const submission = await FormSubmission.findById(submissionId);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Soumission non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour les champs
    if (status !== undefined) {
      submission.status = status;
      
      if (status === 'processed') {
        submission.processedAt = new Date();
        submission.processedBy = new mongoose.Types.ObjectId(payload.userId);
      }
    }
    
    if (notes !== undefined) submission.notes = notes;
    if (tags !== undefined) submission.tags = tags;
    if (isRead !== undefined) submission.isRead = isRead;
    if (isStarred !== undefined) submission.isStarred = isStarred;
    
    await submission.save();
    
    // Log d'audit
    await ActivityLog.create({
      user: payload.userId,
      action: 'update',
      category: 'form-submission',
      details: {
        resource: 'form-submission',
        resourceId: submission._id.toString(),
        formName: submission.formName,
        updatedFields: Object.keys(body),
      },
    });
    
    return NextResponse.json({ submission });
    
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/form-submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une ou plusieurs soumissions
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
    const submissionId = searchParams.get('id');
    const formId = searchParams.get('formId');
    const deleteAll = searchParams.get('deleteAll') === 'true';
    
    let deletedCount = 0;
    
    if (submissionId) {
      // Supprimer une soumission spécifique
      const submission = await FormSubmission.findById(submissionId);
      
      if (!submission) {
        return NextResponse.json(
          { error: 'Soumission non trouvée' },
          { status: 404 }
        );
      }
      
      await submission.deleteOne();
      deletedCount = 1;
      
    } else if (deleteAll && formId) {
      // Supprimer toutes les soumissions d'un formulaire
      const result = await FormSubmission.deleteMany({ formId });
      deletedCount = result.deletedCount || 0;
      
    } else {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }
    
    // Log d'audit
    await ActivityLog.create({
      user: payload.userId,
      action: 'delete',
      category: 'form-submission',
      details: {
        resource: 'form-submission',
        resourceId: submissionId || formId || '',
        deletedCount,
        deleteAll,
      },
    });
    
    return NextResponse.json({
      message: `${deletedCount} soumission(s) supprimée(s) avec succès`,
      deletedCount,
    });
    
  } catch (error: any) {
    console.error('Erreur DELETE /api/admin/form-submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
