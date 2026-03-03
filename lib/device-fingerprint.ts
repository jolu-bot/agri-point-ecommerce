import crypto from 'crypto';

export interface DeviceFingerprint {
  fingerprint: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  canvasFp?: string;
  webglFp?: string;
  timestamp: number;
}

/**
 * Génère un fingerprint device client-side
 */
export function generateClientFingerprint(): Omit<DeviceFingerprint, 'fingerprint'> {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      timezone: '',
      screenResolution: '0x0',
      timestamp: Date.now(),
    };
  }

  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    userAgent,
    language,
    timezone,
    screenResolution,
    timestamp: Date.now(),
  };
}

/**
 * Génère un fingerprint device server-side (pour validation)
 */
export function generateServerFingerprint(clientData: Omit<DeviceFingerprint, 'fingerprint'>): string {
  const components = [
    clientData.userAgent,
    clientData.language,
    clientData.timezone,
    clientData.screenResolution,
  ]
    .filter(Boolean)
    .join('|');

  return crypto.createHash('sha256').update(components).digest('hex');
}

/**
 * Vérifie si le fingerprint matches entre client et serveur
 */
export function verifyFingerprint(clientData: Omit<DeviceFingerprint, 'fingerprint'>, storedFingerprint: string): boolean {
  const computedFp = generateServerFingerprint(clientData);
  return computedFp === storedFingerprint;
}

/**
 * Détecte les changements de device pour une session utilisateur
 */
export function detectDeviceChange(
  currentFp: DeviceFingerprint,
  previousFp: DeviceFingerprint
): boolean {
  const changes = [];

  if (currentFp.userAgent !== previousFp.userAgent) changes.push('userAgent');
  if (currentFp.language !== previousFp.language) changes.push('language');
  if (currentFp.timezone !== previousFp.timezone) changes.push('timezone');
  if (currentFp.screenResolution !== previousFp.screenResolution) changes.push('screenResolution');

  return changes.length > 0;
}

/**
 * Génère un score de confiance (0-100)
 * Plus le score est haut, plus c'est probablement le même device
 */
export function calculateTrustScore(
  currentFp: DeviceFingerprint,
  previousFp: DeviceFingerprint
): number {
  let score = 100;

  // Vérifier chaque composant
  if (currentFp.userAgent !== previousFp.userAgent) score -= 30;
  if (currentFp.language !== previousFp.language) score -= 10;
  if (currentFp.timezone !== previousFp.timezone) score -= 15;
  if (currentFp.screenResolution !== previousFp.screenResolution) score -= 20;

  // Vérifier la durée depuis la dernière utilisation
  const timeDiff = currentFp.timestamp - previousFp.timestamp;
  const daysDiff = timeDiff / (24 * 60 * 60 * 1000);

  if (daysDiff > 30) score -= 20; // Plus de 30 jours = score réduit

  return Math.max(0, score);
}

/**
 * Hook React pour generateClientFingerprint avec SSR compatibility
 */
export function useDeviceFingerprint() {
  if (typeof window !== 'undefined') {
    return generateClientFingerprint();
  }
  return null;
}
