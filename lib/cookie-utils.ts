export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'cookie_preferences';
const CONSENT_KEY = 'cookie_consent_given';
const VERSION_KEY = 'cookie_consent_version';
const CURRENT_VERSION = '1.0.0';

/**
 * Charge les préférences de cookies depuis localStorage
 */
export function loadCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as CookiePreferences;
    }
  } catch (error) {
    console.error('Failed to load cookie preferences:', error);
  }

  return getDefaultPreferences();
}

/**
 * Sauvegarde les préférences localement et via API
 */
export async function saveCookiePreferences(
  preferences: CookiePreferences
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Toujours forcer les cookies nécessaires
    const validPreferences = {
      ...preferences,
      necessary: true,
    };

    // Sauvegarde locale
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPreferences));
    localStorage.setItem(CONSENT_KEY, 'true');
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

    // Sauvegarde via API (asynchrone, n'attend pas)
    saveCookiePreferencesViaAPI(validPreferences).catch((error) => {
      console.error('Failed to save preferences via API:', error);
    });

    return true;
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
    return false;
  }
}

/**
 * Sauvegarde les préférences via l'API serveur
 */
async function saveCookiePreferencesViaAPI(
  preferences: CookiePreferences
): Promise<void> {
  const response = await fetch('/api/cookies/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preferences }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save preferences: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Réinitialise les préférences de cookies
 */
export async function resetCookiePreferences(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(VERSION_KEY);

    // Appeler l'API pour réinitialiser côté serveur
    await fetch('/api/cookies/preferences', {
      method: 'DELETE',
    }).catch((error) => {
      console.error('Failed to reset preferences via API:', error);
    });

    return true;
  } catch (error) {
    console.error('Failed to reset cookie preferences:', error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur a donné son consentement
 */
export function hasGivenCookieConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(CONSENT_KEY) === 'true';
}

/**
 * Vérifie si un type de cookie est autorisé
 */
export function isCookieTypeEnabled(type: keyof CookiePreferences): boolean {
  const preferences = loadCookiePreferences();
  return preferences[type] || false;
}

/**
 * Retourne les préférences par défaut
 */
export function getDefaultPreferences(): CookiePreferences {
  return {
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    preferences: false,
  };
}

/**
 * Charge un script tiers de manière sécurisée
 * Utilise async/defer et event listeners pour le suivi
 */
export function loadThirdPartyScript(
  scriptId: string,
  src: string,
  cookieType: keyof CookiePreferences,
  options?: {
    async?: boolean;
    defer?: boolean;
    integrity?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
  }
): void {
  // Vérifier les permissions
  if (!isCookieTypeEnabled(cookieType)) {
    console.warn(`⚠️ Script ${scriptId} blocked: ${cookieType} not consented`);
    return;
  }

  // Vérifier si déjà chargé
  if (document.getElementById(scriptId)) {
    console.log(`ℹ️ Script ${scriptId} already loaded`);
    return;
  }

  // Créer et ajouter le script
  const script = document.createElement('script');
  script.id = scriptId;
  script.src = src;
  
  if (options?.async !== false) script.async = true;
  if (options?.defer) script.defer = true;
  if (options?.integrity) script.integrity = options.integrity;
  if (options?.crossOrigin) script.crossOrigin = options.crossOrigin;

  // Event listeners
  script.onload = () => {
    console.log(`✅ Script ${scriptId} loaded successfully`);
  };

  script.onerror = () => {
    console.error(`❌ Failed to load script ${scriptId}`);
  };

  document.head.appendChild(script);
}

/**
 * Charge Google Analytics de manière sécurisée
 */
export function loadGoogleAnalytics(gaId: string): void {
  if (!isCookieTypeEnabled('analytics')) {
    console.warn('⚠️ Google Analytics blocked: analytics cookies not consented');
    return;
  }

  // Charger Google Analytics
  loadThirdPartyScript('ga-script', `https://www.googletagmanager.com/gtag/js?id=${gaId}`, 'analytics', {
    async: true,
  });

  // Initialiser window.dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window.dataLayer as any).push(arguments);
  }
  (gtag as any).l = new Date().getTime();
  gtag('js', new Date());
  gtag('config', gaId, {
    anonymize_ip: true, // Anonymiser les IPs pour la confidentialité
    allow_google_signals: false, // Respecter les préférences utilisateur
  });

  console.log(`✅ Google Analytics initialized with ID: ${gaId}`);
}

/**
 * Charge Facebook Pixel
 */
export function loadFacebookPixel(pixelId: string): void {
  if (!isCookieTypeEnabled('marketing')) {
    console.warn('⚠️ Facebook Pixel blocked: marketing cookies not consented');
    return;
  }

  loadThirdPartyScript('fb-pixel', `https://connect.facebook.net/en_US/fbevents.js`, 'marketing', {
    async: true,
  });

  // Initialiser Facebook Pixel
  (window as any).fbq = (window as any).fbq || function (...args: any[]) {
    if ((window as any).fbq.callMethod) {
      (window as any).fbq.callMethod.apply((window as any).fbq, args);
    } else {
      (window as any).fbq.queue.push(args);
    }
  };
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  // Init pixel
  (window as any).fbq('init', pixelId);
  (window as any).fbq('track', 'PageView');

  console.log(`✅ Facebook Pixel initialized with ID: ${pixelId}`);
}

/**
 * Envoyer un événement tracking
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, any>
): void {
  if (!isCookieTypeEnabled('analytics')) {
    console.warn('⚠️ Tracking blocked: analytics cookies not consented');
    return;
  }

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, eventData || {});
  }

  // Facebook Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', eventName, eventData || {});
  }

  console.log(`📊 Event tracked: ${eventName}`, eventData);
}
