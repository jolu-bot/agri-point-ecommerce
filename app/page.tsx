import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Sections from '@/components/home/Sections';
import UrbanAgriculture from '@/components/home/UrbanAgriculture';
import dynamic from 'next/dynamic';

// Lazy load UNIQUEMENT les composants non-critiques (sous le fold)
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

const Newsletter = dynamic(() => import('@/components/home/Newsletter'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedProducts />
      <Sections />
      <UrbanAgriculture />
      <Testimonials />
      <Newsletter />
    </>
  );
}
