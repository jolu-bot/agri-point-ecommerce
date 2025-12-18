// Lazy load des composants lourds
import dynamic from 'next/dynamic';

// Charts - Chargés uniquement quand nécessaires
export const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

export const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

export const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

// PDF Export - Chargé uniquement au clic
export const PDFGenerator = dynamic(() => import('@/lib/pdf-generator'), {
  loading: () => <span>Génération...</span>,
  ssr: false,
});

// Editor - Chargé uniquement sur pages d'édition
export const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

// AgriBot - Chargé uniquement sur demande
export const AgriBot = dynamic(() => import('@/components/agribot/AgriBot'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

// Image Gallery - Chargé avec lazy
export const ImageGallery = dynamic(() => import('@/components/ImageGallery'), {
  loading: () => <div className="grid grid-cols-3 gap-4"><div className="h-32 bg-gray-100 animate-pulse rounded" /><div className="h-32 bg-gray-100 animate-pulse rounded" /><div className="h-32 bg-gray-100 animate-pulse rounded" /></div>,
  ssr: false,
});

// Analytics Dashboard - Chargé uniquement sur page analytics
export const AnalyticsDashboard = dynamic(() => import('@/components/admin/AnalyticsDashboard'), {
  loading: () => <div className="space-y-4"><div className="h-24 bg-gray-100 animate-pulse rounded" /><div className="h-64 bg-gray-100 animate-pulse rounded" /></div>,
  ssr: false,
});
