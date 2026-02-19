import AuditLog from '@/models/AuditLog';
import { NextRequest } from 'next/server';

interface CreateAuditLogParams {
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'rollback' | 'view' | 'restore';
  resource: string;
  resourceId?: string;
  description: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: any;
  tags?: string[];
  request?: NextRequest;
}

/**
 * Créer un log d'audit
 * Utiliser dans toutes les routes admin pour tracer les actions
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const {
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      description,
      severity = 'info',
      metadata,
      tags = [],
      request
    } = params;

    // Extraire les infos de la requête si fournie
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    let requestMethod: string | undefined;
    let requestPath: string | undefined;

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
      userAgent = request.headers.get('user-agent') || 'unknown';
      requestMethod = request.method;
      requestPath = request.nextUrl.pathname;
    }

    await AuditLog.create({
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource,
      resourceId,
      description,
      severity,
      metadata,
      ipAddress,
      userAgent,
      requestMethod,
      requestPath,
      tags,
      createdAt: new Date()
    });
  } catch (error) {
    // Ne pas bloquer l'opération principale si le log échoue
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Calculer les changements entre deux objets
 * Utile pour metadata.changes
 */
export function calculateChanges(before: any, after: any): Array<{ field: string; oldValue: any; newValue: any }> {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {})
  ]);

  allKeys.forEach(key => {
    const oldValue = before?.[key];
    const newValue = after?.[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue
      });
    }
  });

  return changes;
}

/**
 * Déterminer automatiquement la sévérité selon l'action
 */
export function getDefaultSeverity(action: string, resource: string): 'info' | 'warning' | 'error' | 'critical' {
  // Actions critiques
  if (action === 'delete' || action === 'rollback') {
    return 'warning';
  }

  // Resources critiques
  if (resource === 'site-config' || resource === 'user') {
    if (action === 'update' || action === 'create') {
      return 'warning';
    }
  }

  // Par défaut
  return 'info';
}
