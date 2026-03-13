import type { Metadata } from 'next';

// Pages du compte — privées, ne pas indexer
export const metadata: Metadata = {
  title: 'Mes commandes | AGRIPOINT SERVICES',
  robots: { index: false, follow: false },
};

export default function CommandesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
