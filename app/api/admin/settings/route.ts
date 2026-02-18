import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Settings from '@/models/Settings';

// GET - Récupérer les paramètres
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    
    if (!user || !['admin', 'manager', 'redacteur'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    let settings = await Settings.findOne();
    
    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      settings = await Settings.create({
        siteName: 'AGRI POINT SERVICE',
        siteDescription: 'Distributeur exclusif TIMAC AGRO au Cameroun',
        contactEmail: 'infos@agri-ps.com',
        contactPhone: '+237 657 39 39 39',
        contactWhatsApp: '+237 676 02 66 01',
        address: 'Yaoundé, Cameroun',
        city: 'Yaoundé',
        postalCode: '00000',
        agribot: {
          enabled: true,
          model: 'gpt-4',
          systemPrompt: 'Tu es AgriBot...',
          temperature: 0.7,
          maxTokens: 500,
        },
        email: {
          enabled: false,
          provider: 'smtp',
          fromName: 'AGRI POINT',
          fromEmail: 'noreply@agri-ps.com',
        },
        payment: {
          campost: { 
            enabled: true, 
            accountNumber: '', 
            accountName: 'Agri Point Services' 
          },
          cashOnDelivery: { enabled: true },
        },
        shipping: {
          freeShippingThreshold: 50000,
          standardShippingCost: 2500,
          expressShippingCost: 5000,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur GET settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    
    if (!user || !['admin', 'redacteur'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await req.json();

    let settings = await Settings.findOne();
    
    if (settings) {
      Object.assign(settings, body);
      await settings.save();
    } else {
      settings = await Settings.create(body);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Erreur PUT settings:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
