import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { logger, logRequest, logError, createRequestContext } from '@/lib/logger';

/**
 * PREMIUM Health Check Endpoint
 * URL: /api/health
 * Tests all connections + logs with Pino
 * Used by Vercel health probes, K8s liveness checks, load balancers
 */

const START_TIME = Date.now();

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const context = createRequestContext(req);

  try {
    const health: any = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      uptime: Date.now() - START_TIME,
      appVersion: process.env.APP_VERSION || '1.0.0',
      checks: {
        mongodb: { status: 'pending', details: null },
        environment: { status: 'pending', details: {} },
        collections: { status: 'pending', details: [] },
        memory: { status: 'ok', usage: {} }
      }
    };

    // 1. Environment variables check
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

    // 2. MongoDB connectivity
    try {
      const dbStartTime = Date.now();
      await dbConnect();
      const dbLatency = Date.now() - dbStartTime;
      
      health.checks.mongodb = {
        status: 'healthy',
        latency: dbLatency,
        details: {
          readyState: mongoose.connection.readyState, // 1 = connected
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      };

      // 3. Collection stats
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

      logError(dbError, {
        requestId: context.requestId,
        endpoint: '/api/health',
        severity: 'high'
      });
    }

    // 4. Memory usage
    const mem = process.memoryUsage();
    health.checks.memory = {
      status: 'ok',
      usage: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(mem.rss / 1024 / 1024) + 'MB'
      }
    };

    // Determine overall status
    const allHealthy = Object.values(health.checks).every(
      (check: any) => check.status === 'healthy' || check.status === 'ok'
    );
    health.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;
    const duration = Date.now() - startTime;

    logRequest({
      ...context,
      statusCode,
      duration
    });
    
    return NextResponse.json(health, { status: statusCode });

  } catch (error: any) {
    const duration = Date.now() - startTime;

    logError(error, {
      requestId: context.requestId,
      endpoint: '/api/health',
      severity: 'critical'
    });

    logRequest({
      ...context,
      statusCode: 500,
      duration,
      error: error?.message || String(error)
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
