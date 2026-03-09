import HeroNew from '@/components/home/HeroNew';
import Stats from '@/components/home/Stats';
import Sections from '@/components/home/Sections';
import SectorsGrid from '@/components/home/SectorsGrid';
import dynamic from 'next/dynamic';

// Lazy load UNIQUEMENT les composants non-critiques (sous le fold)
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

export default function Home() {
  return (
    <>
      <HeroNew />
      <Stats />
      <Sections />
      <SectorsGrid />
      <Newsletter />
    </>
  );
}
