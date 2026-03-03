/// <reference types="../types/modules" />
import { generateSecret, TOTP } from 'otplib';
import qrcode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerify {
  token: string;
  backupCode?: string;
}

/**
 * Génère un secret TOTP et un code QR pour 2FA
 */
export async function generateTwoFactorSecret(email: string): Promise<TwoFactorSetup> {
  // Générer le secret
  const secret = generateSecret({
    name: `AGRI POINT SERVICE (${email})`,
    issuer: 'AGRI POINT SERVICE',
    length: 32,
  });

  // Générer les codes de secours (10 codes)
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  // Générer le code QR
  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.secret,
    qrCode,
    backupCodes,
  };
}

/**
 * Vérifie un token TOTP
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  try {
    const totp = new TOTP({ secret, window: 1 });
    return totp.check(token);
  } catch (error) {
    console.error('TOTP verification failed:', error);
    return false;
  }
}

/**
 * Vérifie un code de secours
 */
export function verifyBackupCode(backupCode: string, hashedCodes: string[]): boolean {
  // Les codes de secours sont hashés avec bcrypt dans la BD
  // Cette fonction est utilisée avec bcrypt.compare
  return hashedCodes.some(hashed => hashed === backupCode);
}

/**
 * Génère un nouveau token TOTP (pour test/debug)
 */
export function generateTOTPToken(secret: string): string {
  const totp = new TOTP({ secret });
  return totp.generate();
}

/**
 * Récupère le temps avant expiration du token actuel
 */
export function getTokenTimeRemaining(): number {
  const now = Date.now();
  const timeStep = 30000; // 30 secondes par défaut
  const remaining = timeStep - (now % timeStep);
  return Math.round(remaining / 1000);
}
