import { useEffect, useState } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function useCookiePreferences() {
  const [preferences, setPreferencesState] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cookie_preferences');
    if (saved) {
      try {
        setPreferencesState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const setPreferences = (prefs: CookiePreferences) => {
    setPreferencesState(prefs);
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
    
    // Aussi sauvegarder en cookie pour server-side
    document.cookie = `cookie_preferences=${encodeURIComponent(JSON.stringify(prefs))}; max-age=31536000; path=/; secure; samesite=lax`;
  };

  const hasGivenConsent = () => {
    return localStorage.getItem('cookie_consent_given') !== null;
  };

  const resetConsent = () => {
    localStorage.removeItem('cookie_consent_given');
    localStorage.removeItem('cookie_preferences');
    localStorage.removeItem('cookie_consent_version');
    document.cookie = 'cookie_preferences=; max-age=0; path=/';
  };

  return {
    preferences,
    setPreferences,
    hasGivenConsent,
    resetConsent,
    isLoaded,
  };
}

// Utilité pour vérifier si un cookie est autorisé
export function isCookieEnabled(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;

  const saved = localStorage.getItem('cookie_preferences');
  if (!saved) return false;

  try {
    const prefs: CookiePreferences = JSON.parse(saved);
    return prefs[type] || false;
  } catch {
    return false;
  }
}

// Utility pour charger conditionnellement des scripts
export function loadScriptIfConsented(
  scriptId: string,
  src: string,
  type: keyof CookiePreferences,
  callback?: () => void
) {
  if (!isCookieEnabled(type)) {
    console.log(`⚠️ Script ${scriptId} blocked: ${type} cookies not consented`);
    return;
  }

  // Vérifier si déjà chargé
  if (document.getElementById(scriptId)) {
    return;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = src;
  script.async = true;
  if (callback) {
    script.onload = callback;
  }
  document.head.appendChild(script);
  
  console.log(`✅ Script ${scriptId} loaded`);
}
