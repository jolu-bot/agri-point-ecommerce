import { Metadata } from 'next';
import DistributeursClient from '@/components/distributors/DistributeursClient';

export const metadata: Metadata = {
  title: 'Nos distributeurs — AGRIPOINT SERVICES',
  description: 'Trouvez les points de vente AGRIPOINT le plus proche de vous au Cameroun.',
  alternates: { canonical: '/nos-distributeurs' },
};

export default function NosDistributeursPage() {
  return <DistributeursClient />;
}
