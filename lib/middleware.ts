import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, hasPermission } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: { permissions?: string[] }
) {
  return async (req: NextRequest) => {
    try {
      // Récupérer le token
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Non autorisé - Token manquant' },
          { status: 401 }
        );
      }

      // Vérifier le token
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Non autorisé - Token invalide' },
          { status: 401 }
        );
      }

      // Vérifier les permissions si nécessaire
      if (options?.permissions) {
        const hasRequiredPermission = options.permissions.some(permission =>
          hasPermission(decoded.role, permission)
        );

        if (!hasRequiredPermission) {
          return NextResponse.json(
            { error: 'Accès interdit - Permissions insuffisantes' },
            { status: 403 }
          );
        }
      }

      // Ajouter l'utilisateur à la requête
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decoded;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Erreur middleware auth:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }
  };
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
