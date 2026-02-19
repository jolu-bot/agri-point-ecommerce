import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';

// GET - Informations sur l'événement
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const slug = params.slug;
    
    const event = await Event.findOne({ slug, status: 'published' });
    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }
    
    // Incrémenter les vues
    event.stats.views += 1;
    await event.save();
    
    // Vérifier les places disponibles
    const availableSpots = event.getAvailableSpots();
    const canRegister = event.canRegister();
    
    return NextResponse.json({
      event,
      availableSpots,
      canRegister,
    });
  } catch (error: any) {
    console.error('GET /api/public/events/[slug] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - S'inscrire à l'événement
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const slug = params.slug;
    const body = await request.json();
    
    // Récupérer l'événement
    const event = await Event.findOne({ slug, status: 'published' });
    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }
    
    // Vérifier si les inscriptions sont ouvertes
    if (!event.canRegister()) {
      return NextResponse.json({
        error: 'Les inscriptions sont fermées pour cet événement',
      }, { status: 403 });
    }
    
    // Vérifier si l'événement est complet
    const isFull = event.isFull();
    const isWaitlist = isFull && event.registrationOptions.allowWaitlist;
    
    if (isFull && !event.registrationOptions.allowWaitlist) {
      return NextResponse.json({
        error: 'Événement complet',
      }, { status: 403 });
    }
    
    // Vérifier si déjà inscrit
    const existingRegistration = await EventRegistration.findOne({
      eventId: event._id,
      email: body.email,
      status: { $ne: 'cancelled' },
    });
    
    if (existingRegistration) {
      return NextResponse.json({
        error: 'Vous êtes déjà inscrit à cet événement',
      }, { status: 409 });
    }
    
    // Déterminer le prix
    let price = event.pricing.isFree ? 0 : event.pricing.price || 0;
    const now = new Date();
    
    if (event.pricing.earlyBirdDeadline && now < event.pricing.earlyBirdDeadline) {
      price = event.pricing.earlyBirdPrice || price;
    }
    
    // Créer l'inscription
    const registration = new EventRegistration({
      eventId: event._id,
      eventSlug: event.slug,
      eventTitle: event.title,
      eventStartDate: event.startDate,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
      numberOfAttendees: body.numberOfAttendees || 1,
      attendeeNames: body.attendeeNames,
      customFields: body.customFields || [],
      isWaitlist,
      status: isWaitlist ? 'waitlist' : (event.registrationOptions.requiresApproval ? 'pending' : 'confirmed'),
      payment: event.pricing.isFree ? undefined : {
        status: 'pending',
        amount: price,
        currency: event.pricing.currency || 'EUR',
        method: 'free',
      },
    });
    
    // Générer le QR code si confirmé
    if (registration.status === 'confirmed') {
      await registration.generateQRCode();
      registration.confirmedAt = new Date();
    }
    
    await registration.save();
    
    // Mettre à jour l'événement
    if (isWaitlist) {
      event.waitlistCount += 1;
      
      // Calculer la position dans la liste d'attente
      const waitlistPosition = event.waitlistCount;
      registration.waitlistPosition = waitlistPosition;
      await registration.save();
    } else {
      event.currentAttendees += body.numberOfAttendees || 1;
      event.stats.totalRegistrations += 1;
      if (registration.status === 'confirmed') {
        event.stats.confirmedAttendees += 1;
      }
    }
    
    await event.save();
    
    // Envoyer l'email de confirmation
    if (registration.status === 'confirmed' && event.notifications.confirmationEmail) {
      await registration.sendConfirmationEmail();
    }
    
    // Audit log
    console.log(`[AUDIT] Nouvelle inscription: ${registration.fullName} pour ${event.title}`);
    
    return NextResponse.json({
      success: true,
      message: isWaitlist
        ? 'Vous avez été ajouté à la liste d\'attente'
        : 'Inscription confirmée',
      registration: {
        registrationNumber: registration.registrationNumber,
        status: registration.status,
        isWaitlist: registration.isWaitlist,
        waitlistPosition: registration.waitlistPosition,
        qrCode: registration.qrCode,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/public/events/[slug] error:', error);
    return NextResponse.json({
      error: 'Erreur lors de l\'inscription',
      details: error.message,
    }, { status: 500 });
  }
}
