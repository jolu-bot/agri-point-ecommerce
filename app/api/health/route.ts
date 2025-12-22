import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

/**
 * API de diagnostic santé complète
 * URL: /api/health
 * Teste toutes les connexions et affiche l'état du système
 */
export async function GET() {
  const health: any = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    checks: {
      mongodb: { status: 'pending', details: null },
      environment: { status: 'pending', details: {} },
      collections: { status: 'pending', details: [] }
    }
  };

  try {
    // 1. Vérifier les variables d'environnement critiques
    const envVars = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV
    };

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => key !== 'NODE_ENV' && !value)
      .map(([key]) => key);

    health.checks.environment = {
      status: missingVars.length === 0 ? 'healthy' : 'warning',
      variables: envVars,
      missing: missingVars.length > 0 ? missingVars : undefined
    };

    // 2. Tester la connexion MongoDB
    try {
      await dbConnect();
      
      health.checks.mongodb = {
        status: 'healthy',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      };

      // 3. Compter les documents dans chaque collection
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        const collectionStats = [];

        for (const coll of collections) {
          const count = await db.collection(coll.name).countDocuments();
          collectionStats.push({
            name: coll.name,
            documents: count
          });
        }

        health.checks.collections = {
          status: 'healthy',
          details: collectionStats
        };
      }

    } catch (dbError: any) {
      health.checks.mongodb = {
        status: 'unhealthy',
        error: dbError.message
      };
    }

    // Déterminer le statut global
    const allHealthy = Object.values(health.checks).every(
      (check: any) => check.status === 'healthy'
    );
    health.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });

  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
