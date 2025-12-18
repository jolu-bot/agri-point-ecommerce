'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SiteConfigContextType {
  config: any;
  loading: boolean;
  updateConfig: (newConfig: any) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/site-config');
      
      if (!response.ok) {
        console.error('Erreur API:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Détails erreur:', errorText);
        // Utiliser config par défaut en cas d'erreur
        setConfig({
          branding: { siteName: 'AGRI POINT SERVICE', tagline: 'Produire plus, Gagner plus, Mieux vivre' },
          colors: { primary: '#1B5E20', secondary: '#B71C1C' },
          typography: { fontFamily: { heading: 'Montserrat', body: 'Inter' } },
        });
        return;
      }
      
      const data = await response.json();
      setConfig(data);
      
      // Appliquer le thème immédiatement
      if (data.colors) {
        applyTheme(data.colors, data.typography);
      }
    } catch (error) {
      console.error('Erreur chargement configuration:', error);
      // Config par défaut en cas d'erreur
      setConfig({
        branding: { siteName: 'AGRI POINT SERVICE', tagline: 'Produire plus, Gagner plus, Mieux vivre' },
        colors: { primary: '#1B5E20', secondary: '#B71C1C' },
        typography: { fontFamily: { heading: 'Montserrat', body: 'Inter' } },
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: any) => {
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        
        // Appliquer le nouveau thème
        if (data.config.colors) {
          applyTheme(data.config.colors, data.config.typography);
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour configuration:', error);
      throw error;
    }
  };

  const refreshConfig = async () => {
    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, updateConfig, refreshConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}

// Fonction pour appliquer le thème dynamiquement
function applyTheme(colors: any, typography: any) {
  const root = document.documentElement;

  // Appliquer les couleurs
  if (colors) {
    if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
    if (colors.primaryLight) root.style.setProperty('--color-primary-light', colors.primaryLight);
    if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
    if (colors.secondaryLight) root.style.setProperty('--color-secondary-light', colors.secondaryLight);
    if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
    if (colors.background) root.style.setProperty('--color-background', colors.background);
    if (colors.text) root.style.setProperty('--color-text', colors.text);
  }

  // Appliquer la typographie
  if (typography) {
    if (typography.fontFamily?.heading) {
      root.style.setProperty('--font-heading', typography.fontFamily.heading);
    }
    if (typography.fontFamily?.body) {
      root.style.setProperty('--font-body', typography.fontFamily.body);
    }

    // Tailles de police
    if (typography.fontSize) {
      Object.entries(typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--text-${key}`, value as string);
      });
    }

    // Poids de police
    if (typography.fontWeight) {
      Object.entries(typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value as string);
      });
    }
  }
}
