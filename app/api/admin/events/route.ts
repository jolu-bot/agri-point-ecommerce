import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event, { IEvent } from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { verifyAccessToken } from '@/lib/auth';

// GET - Liste des événements ou événement unique
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // Événement unique
    if (id) {
      const event = await Event.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
      
      if (!event) {
        return NextResponse.json(
          { error: 'Événement non trouvé' },
          { status: 404 }
        );
      }
      
      // Récupérer les statistiques d'inscription
      const registrationStats = {
        total: await EventRegistration.countDocuments({ event: event._id }),
        confirmed: await EventRegistration.countDocuments({ event: event._id, status: 'confirmed' }),
        pending: await EventRegistration.countDocuments({ event: event._id, status: 'pending' }),
        cancelled: await EventRegistration.countDocuments({ event: event._id, status: 'cancelled' }),
      };
      
      return NextResponse.json({
        event,
        registrationStats,
      });
    }
    
    // Liste des événements avec filtres
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    
    // Construction de la requête
    const query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (upcoming) {
      query.startDate = { $gte: new Date() };
      query.status = 'published';
    }
    
    if (past) {
      query.endDate = { $lt: new Date() };
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Requête
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email'),
      Event.countDocuments(query),
    ]);
    
    // Statistiques globales
    const stats = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          physical: {
            $sum: { $cond: [{ $eq: ['$type', 'physical'] }, 1, 0] },
          },
          online: {
            $sum: { $cond: [{ $eq: ['$type', 'online'] }, 1, 0] },
          },
          hybrid: {
            $sum: { $cond: [{ $eq: ['$type', 'hybrid'] }, 1, 0] },
          },
          totalRegistrations: { $sum: '$stats.totalRegistrations' },
          totalViews: { $sum: '$stats.views' },
          totalCheckIns: { $sum: '$stats.checkIns' },
        },
      },
    ]);
    
    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats[0] || {},
    });
  } catch (error: any) {
    console.error('GET /api/admin/events error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer un événement
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validation des dates
    if (new Date(body.startDate) >= new Date(body.endDate)) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }
    
    // Générer le slug
    let slug = body.slug;
    if (!slug && body.title) {
      slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      // Vérifier l'unicité
      let uniqueSlug = slug;
      let counter = 1;
      while (await Event.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = uniqueSlug;
    }
    
    // Créer l'événement
    const event = new Event({
      ...body,
      slug,
      createdBy: payload.userId,
    });
    
    await event.save();
    
    // Audit log
    console.log(`[AUDIT] Événement créé: ${event.title} par userId ${payload.userId}`);
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/events error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Un événement avec ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un événement
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validation des dates si modifiées
    if (body.startDate && body.endDate) {
      if (new Date(body.startDate) >= new Date(body.endDate)) {
        return NextResponse.json(
          { error: 'La date de fin doit être après la date de début' },
          { status: 400 }
        );
      }
    }
    
    const event = await Event.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedBy: payload.userId,
      },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }
    
    // Audit log
    console.log(`[AUDIT] Événement modifié: ${event.title} par userId ${payload.userId}`);
    
    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('PATCH /api/admin/events error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un événement
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification authentification (admin seulement)
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
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const deleteRegistrations = searchParams.get('deleteRegistrations') === 'true';
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }
    
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }
    
    // Compter les inscriptions
    const registrationsCount = await EventRegistration.countDocuments({ eventId: id });
    
    // Supprimer les inscriptions si demandé
    let registrationsDeleted = 0;
    if (deleteRegistrations && registrationsCount > 0) {
      const result = await EventRegistration.deleteMany({ eventId: id });
      registrationsDeleted = result.deletedCount || 0;
    }
    
    // Supprimer l'événement
    await Event.findByIdAndDelete(id);
    
    // Audit log
    console.log(`[AUDIT] Événement supprimé: ${event.title} par userId ${payload.userId} (${registrationsCount} inscriptions, ${registrationsDeleted} supprimées)`);
    
    return NextResponse.json({
      message: 'Événement supprimé',
      registrationsCount,
      registrationsDeleted,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/events error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
