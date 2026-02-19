import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EventRegistration, { IEventRegistration } from '@/models/EventRegistration';
import Event from '@/models/Event';
import { verifyAccessToken } from '@/lib/auth';

// GET - Liste des inscriptions
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification de l'auth simplifiée (TODO: implémenter verifyAccessToken)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const exportCSV = searchParams.get('export') === 'csv';
    
    // Export CSV
    if (exportCSV && eventId) {
      // @ts-expect-error - Mongoose static method
      const csv = await EventRegistration.exportToCSV(eventId);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=inscriptions-${Date.now()}.csv`,
        },
      });
    }
    
    // Inscription unique
    if (id) {
      const registration = await EventRegistration.findById(id)
        .populate('eventId', 'title slug startDate')
        .populate('userId', 'name email');
      
      if (!registration) {
        return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
      }
      
      return NextResponse.json({ registration });
    }
    
    // Liste des inscriptions
    const query: any = {};
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [registrations, total] = await Promise.all([
      EventRegistration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('eventId', 'title slug startDate')
        .populate('userId', 'name email'),
      EventRegistration.countDocuments(query),
    ]);
    
    // Stats si eventId fourni
    let stats = null;
    if (eventId) {
      // @ts-expect-error - Mongoose static method
      stats = await EventRegistration.getEventStats(eventId);
    }
    
    return NextResponse.json({
      registrations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
    });
  } catch (error: any) {
    console.error('GET /api/admin/registrations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mettre à jour une inscription
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification de l'auth simplifiée (TODO: implémenter verifyAccessToken)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    const body = await request.json();
    const { action, ...updateData } = body;
    
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }
    
    // Actions spéciales
    if (action === 'confirm') {
      registration.confirm();
      await registration.save();
      
      // Mettre à jour l'événement
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { 'stats.confirmedAttendees': 1 },
      });
    } else if (action === 'cancel') {
      registration.cancel(body.reason);
      await registration.save();
      
      // Mettre à jour l'événement
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { currentAttendees: -registration.numberOfAttendees },
      });
    } else if (action === 'checkIn') {
      // @ts-expect-error - Mongoose instance method
      registration.checkIn('system'); // TODO: utiliser l'ID utilisateur vérifié
      await registration.save();
      
      // Mettre à jour l'événement
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { 'stats.checkIns': 1 },
      });
    } else {
      // Mise à jour normale
      Object.assign(registration, updateData);
      await registration.save();
    }
    
    return NextResponse.json({ registration });
  } catch (error: any) {
    console.error('PATCH /api/admin/registrations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une inscription
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification de l'auth simplifiée (TODO: implémenter verifyAccessToken)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 });
    }
    
    // Mettre à jour l'événement
    await Event.findByIdAndUpdate(registration.eventId, {
      $inc: {
        currentAttendees: -registration.numberOfAttendees,
        'stats.totalRegistrations': -1,
      },
    });
    
    await EventRegistration.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Inscription supprimée' });
  } catch (error: any) {
    console.error('DELETE /api/admin/registrations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
