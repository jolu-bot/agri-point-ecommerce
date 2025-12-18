import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import FeaturedProducts from '@/components/home/FeaturedProducts';

// Lazy load des composants non-critiques pour améliorer le temps de chargement initial
const Sections = dynamic(() => import('@/components/home/Sections'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

const UrbanAgriculture = dynamic(() => import('@/components/home/UrbanAgriculture'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
});

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
