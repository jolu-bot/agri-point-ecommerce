'use client';

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

export function ClientComponents() {
  return (
    <>
      <PreviewModeBanner />
      <AgriBotWrapper />
      <PWAInstallPrompt />
      <SyncStatusPanel />
    </>
  );
}
