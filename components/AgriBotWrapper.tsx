'use client';

import dynamic from 'next/dynamic';

const AgriBot = dynamic(() => import("@/components/agribot/AgriBot"), {
  ssr: false,
  loading: () => null,
});

export default function AgriBotWrapper() {
  return <AgriBot />;
}
