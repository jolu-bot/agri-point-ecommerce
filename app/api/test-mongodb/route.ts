import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

/**
 * API de diagnostic MongoDB
 * URL: /api/test-mongodb
 * Vérifie si MongoDB se connecte correctement
 */
export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: []
    };

    // 1. Vérifier que MONGODB_URI existe
    diagnostics.checks.push({
      test: 'Variable MONGODB_URI',
      status: process.env.MONGODB_URI ? '✅ Existe' : '❌ MANQUANTE',
      value: process.env.MONGODB_URI 
        ? process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@') 
        : 'NON DÉFINIE'
    });

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI n\'est pas définie',
        diagnostics
      }, { status: 500 });
    }

    // 2. Tester la connexion
    diagnostics.checks.push({
      test: 'Connexion MongoDB',
      status: 'En cours...'
    });

    try {
      await dbConnect();
      
      diagnostics.checks[1].status = '✅ CONNECTÉ';
      diagnostics.checks[1].readyState = mongoose.connection.readyState;
      diagnostics.checks[1].host = mongoose.connection.host;
      diagnostics.checks[1].name = mongoose.connection.name;

      // 3. Compter les documents dans les collections
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        diagnostics.collections = [];

        for (const coll of collections) {
          const count = await db.collection(coll.name).countDocuments();
          diagnostics.collections.push({
            name: coll.name,
            documents: count
          });
        }

        diagnostics.checks.push({
          test: 'Collections',
          status: `✅ ${collections.length} collection(s) trouvée(s)`
        });
      }

      return NextResponse.json({
        success: true,
        message: '✅ MongoDB fonctionne correctement !',
        diagnostics
      });

    } catch (dbError: any) {
      diagnostics.checks[1] = {
        test: 'Connexion MongoDB',
        status: '❌ ÉCHEC',
        error: dbError.message
      };

      return NextResponse.json({
        success: false,
        error: 'Impossible de se connecter à MongoDB',
        diagnostics
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
