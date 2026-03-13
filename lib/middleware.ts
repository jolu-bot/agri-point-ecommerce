import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, hasPermission } from '@/lib/auth';
import { applySecurityHeaders, logSecurityEvent } from '@/lib/security';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const ADMIN_ROLES = ['admin', 'superadmin', 'moderator'] as const;

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: { permissions?: string[]; roles?: string[] }
) {
  return async (req: NextRequest) => {
    try {
      // Support Bearer header ET cookie HttpOnly
      const authHeader = req.headers.get('authorization');
      const cookieToken = req.cookies.get('accessToken')?.value;
      const token = authHeader?.replace('Bearer ', '') ?? cookieToken;

      if (!token) {
        return applySecurityHeaders(NextResponse.json(
          { error: 'Non autorisé - Token manquant' }, { status: 401 }
        ));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        logSecurityEvent({ type: 'token_invalid', ip: req.headers.get('x-forwarded-for') ?? 'unknown', detail: 'withAuth: token invalide' });
        return applySecurityHeaders(NextResponse.json(
          { error: 'Non autorisé - Token invalide' }, { status: 401 }
        ));
      }

      // Vérification des rôles explicites
      if (options?.roles && !options.roles.includes(decoded.role)) {
        return applySecurityHeaders(NextResponse.json(
          { error: 'Accès interdit - Rôle insuffisant' }, { status: 403 }
        ));
      }

      // Vérification des permissions
      if (options?.permissions) {
        const hasRequired = options.permissions.some(p => hasPermission(decoded.role, p));
        if (!hasRequired) {
          return applySecurityHeaders(NextResponse.json(
            { error: 'Accès interdit - Permissions insuffisantes' }, { status: 403 }
          ));
        }
      }

      const authenticatedReq  = req as AuthenticatedRequest;
      authenticatedReq.user   = decoded;

      const response = await handler(authenticatedReq);
      return applySecurityHeaders(response);
    } catch (error) {
      console.error('Erreur middleware auth:', error);
      return applySecurityHeaders(NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }));
    }
  };
}

/** Helper pour restreindre une route aux admins uniquement */
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, { roles: [...ADMIN_ROLES] });
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest) => {
    if (!req.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (!roles.includes(req.user.role)) {
      return NextResponse.json(
        { error: 'Accès interdit - Rôle insuffisant' },
        { status: 403 }
      );
    }

    return null; // Autorisé
  };
}
