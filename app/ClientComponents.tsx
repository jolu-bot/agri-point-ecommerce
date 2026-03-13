'use client';

import { useEffect } from 'react';
import dynamic from "next/dynamic";

const AgriBotWrapper = dynamic(() => import('@/components/AgriBotWrapper'), {
  ssr: false,
  loading: () => null,
});

const SyncStatusPanel = dynamic(() => import('@/components/SyncStatusPanel'), {
  ssr: false,
  loading: () => null,
});

const PreviewModeBanner = dynamic(() => import('@/components/admin/PreviewModeBanner'), {
  ssr: false,
  loading: () => null,
});

const PWAInstallPrompt = dynamic(() => import('@/components/PWAInstallPrompt'), {
  ssr: false,
  loading: () => null,
});

const CookieConsentBanner = dynamic(() => import('@/components/cookies/CookieConsentBanner'), {
  ssr: false,
  loading: () => null,
});

export function ClientComponents() {
  // Enregistrement du service worker (PWA offline + install prompt)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently fails in dev / HTTP environments
      });
    }
  }, []);

  return (
    <>
      <PreviewModeBanner />
      <AgriBotWrapper />
      <PWAInstallPrompt />
      <SyncStatusPanel />
      <CookieConsentBanner />
    </>
  );
}
