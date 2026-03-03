import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface ImpersonationSession {
  id: string;
  adminId: string;
  userId: string;
  reason: string;
  startedAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface MagicLink {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  isValid: boolean;
}

/**
 * Crée une session d'impersonation admin
 */
export function createImpersonationSession(
  adminId: string,
  userId: string,
  reason: string,
  durationMinutes: number,
  ipAddress: string,
  userAgent: string
): ImpersonationSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60000);

  return {
    id: uuidv4(),
    adminId,
    userId,
    reason,
    startedAt: now,
    expiresAt,
    ipAddress,
    userAgent,
    isActive: true,
  };
}

/**
 * Valide une session d'impersonation
 */
export function validateImpersonationSession(session: ImpersonationSession): boolean {
  return session.isActive && new Date() < session.expiresAt;
}

/**
 * Génère un magic link pour passwordless auth
 */
export function generateMagicLink(email: string): MagicLink {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60000); // 15 minutes

  return {
    id: uuidv4(),
    email: email.toLowerCase(),
    token,
    expiresAt,
    isValid: true,
  };
}

/**
 * Valide un magic link
 */
export function validateMagicLink(link: MagicLink): boolean {
  return (
    link.isValid &&
    !link.usedAt &&
    new Date() < link.expiresAt
  );
}

/**
 * Marque un magic link comme utilisé
 */
export function consumeMagicLink(link: MagicLink): void {
  link.usedAt = new Date();
  link.isValid = false;
}

/**
 * Hash magic link token pour stockage sécurisé
 */
export function hashMagicLinkToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * URL du magic link à envoyer par email
 */
export function getMagicLinkURL(token: string, baseUrl: string): string {
  return `${baseUrl}/auth/magic-link?token=${token}`;
}
