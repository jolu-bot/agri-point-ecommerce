'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SiteConfig } from '@/models/SiteConfig';

interface PreviewModeContextType {
  isPreviewMode: boolean;
  previewConfig: any | null;
  enablePreview: (config: any) => void;
  disablePreview: () => void;
  updatePreviewConfig: (updates: any) => void;
  savePreview: () => Promise<void>;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

export function PreviewModeProvider({ children }: { children: React.ReactNode }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<any | null>(null);

  const enablePreview = useCallback((config: any) => {
    setPreviewConfig(config);
    setIsPreviewMode(true);
  }, []);

  const disablePreview = useCallback(() => {
    setPreviewConfig(null);
    setIsPreviewMode(false);
  }, []);

  const updatePreviewConfig = useCallback((updates: any) => {
    setPreviewConfig((prev: any) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const savePreview = useCallback(async () => {
    if (!previewConfig) return;

    const response = await fetch('/api/admin/site-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewConfig),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la sauvegarde');
    }

    // Désactiver le mode preview après sauvegarde
    disablePreview();
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
  }, [previewConfig, disablePreview]);

  return (
    <PreviewModeContext.Provider
      value={{
        isPreviewMode,
        previewConfig,
        enablePreview,
        disablePreview,
        updatePreviewConfig,
        savePreview,
      }}
    >
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  const context = useContext(PreviewModeContext);
  if (context === undefined) {
    throw new Error('usePreviewMode must be used within a PreviewModeProvider');
  }
  return context;
}
