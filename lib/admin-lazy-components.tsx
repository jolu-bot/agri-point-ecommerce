/**
 * PREMIUM Admin Lazy Components
 * Optimized code-splitting for admin dashboard
 */

import dynamic from 'next/dynamic';

// ── LOADING SKELETONS ────────────────────────────────────────────────────────

export const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex gap-4">
      <div className="h-10 bg-gray-200 rounded w-64" />
      <div className="h-10 bg-gray-200 rounded w-32" />
    </div>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48" />
    <div className="h-80 bg-gray-100 rounded" />
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-12 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-32 bg-gray-100 rounded-lg" />
    ))}
  </div>
);

// ── DATA VISUALIZATION ───────────────────────────────────────────────────────

/**
 * Advanced DataTable with sorting, filtering, pagination
 * Lazy-loaded to reduce initial bundle size
@@ * 
@@ * @example Create component:
@@ * components/admin/DataTable.tsx
 */
// export const AdminDataTable = dynamic(
//   () => import('@/components/admin/DataTable'),
//   { loading: TableSkeleton, ssr: false }
// );

/**
 * Real-time charts for analytics dashboard
 * Chart.js + react-chartjs-2 lazy loaded
 */
export const AdminCharts = {
  Bar: dynamic(
    () => import('react-chartjs-2').then(mod => mod.Bar).catch(() => ({ default: ChartSkeleton })),
    { loading: ChartSkeleton, ssr: false }
  ),
  Line: dynamic(
    () => import('react-chartjs-2').then(mod => mod.Line).catch(() => ({ default: ChartSkeleton })),
    { loading: ChartSkeleton, ssr: false }
  ),
  Pie: dynamic(
    () => import('react-chartjs-2').then(mod => mod.Pie).catch(() => ({ default: ChartSkeleton })),
    { loading: ChartSkeleton, ssr: false }
  ),
  Doughnut: dynamic(
    () => import('react-chartjs-2').then(mod => mod.Doughnut).catch(() => ({ default: ChartSkeleton })),
    { loading: ChartSkeleton, ssr: false }
  ),
};

/**
 * Premium Excel Generator - Production Ready
 */
export const ExcelExporter = dynamic(
  () => import('@/lib/excel-generator'),
  {
    loading: () => (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded">
        Chargement...
      </button>
    ),
    ssr: false,
  }
);

// ── FORM COMPONENTS ──────────────────────────────────────────────────────────

/**
 * Rich Text Editor for content creation
 * Heavy dependency - always lazy load
 */
export const RichEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  {
    loading: FormSkeleton,
    ssr: false,
  }
);

/**
 * Image Upload with preview and cropping
@@ * 
@@ * @example Create component:
@@ * components/admin/ImageUploader.tsx
 */
// export const ImageUploader = dynamic(
//   () => import('@/components/admin/ImageUploader'),
//   { loading: () => <div className="h-48 bg-gray-100 rounded animate-pulse" />, ssr: false }
// );

/**
 * Drag & Drop File Manager
@@ * 
@@ * @example Create component:
@@ * components/admin/FileManager.tsx
 */
// export const FileManager = dynamic(
//   () => import('@/components/admin/FileManager'),
//   { loading: () => <div className="h-96 bg-gray-100 rounded animate-pulse" />, ssr: false }
// );

// ── ANALYTICS & REPORTING ────────────────────────────────────────────────────

/**
 * Full Analytics Dashboard with real-time metrics
 * Massive bundle - critical lazy load
 */
export const AnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  {
    loading: CardSkeleton,
    ssr: false,
  }
);

/**
 * CMS Analytics with performance insights
@@ * 
@@ * @example Create component:
@@ * components/admin/CMSAnalytics.tsx
 */
// export const CMSAnalytics = dynamic(
//   () => import('@/components/admin/CMSAnalytics'),
//   { loading: CardSkeleton, ssr: false }
// );

// ── USER MANAGEMENT ──────────────────────────────────────────────────────────

/**
 * User Management Table with bulk actions
@@ * 
@@ * @example Create component:
@@ * components/admin/UserManagementTable.tsx
 */
// export const UserManagementTable = dynamic(
//   () => import('@/components/admin/UserManagementTable'),
//   { loading: TableSkeleton, ssr: false }
// );

/**
 * Permissions & Roles Editor
@@ * 
@@ * @example Create component:
@@ * components/admin/PermissionsEditor.tsx
 */
// export const PermissionsEditor = dynamic(
//   () => import('@/components/admin/PermissionsEditor'),
//   { loading: FormSkeleton, ssr: false }
// );

// ── E-COMMERCE ───────────────────────────────────────────────────────────────

/**
 * Product Editor with variants & media
@@ * 
@@ * @example Create component:
@@ * components/admin/ProductEditor.tsx
 */
// export const ProductEditor = dynamic(
//   () => import('@/components/admin/ProductEditor'),
//   { loading: FormSkeleton, ssr: false }
// );

/**
 * Order Management Dashboard
@@ * 
@@ * @example Create component:
@@ * components/admin/OrdersDashboard.tsx
 */
// export const OrdersDashboard = dynamic(
//   () => import('@/components/admin/OrdersDashboard'),
//   { loading: TableSkeleton, ssr: false }
// );

// ── PREVIEW & INTERACTIVE ────────────────────────────────────────────────────

/**
 * Live Page Preview with iframe
@@ * 
@@ * @example Create component:
@@ * components/admin/PagePreview.tsx
 */
// export const PagePreview = dynamic(
//   () => import('@/components/admin/PagePreview'),
//   { loading: () => <div className="h-screen bg-gray-100 rounded animate-pulse" />, ssr: false }
// );

/**
 * Interactive Map for locations
 */
export const MapEditor = dynamic(
  () => import('@/components/DistributorsMap'),
  {
    loading: () => <div className="h-96 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }
);

// ── UTILITIES ────────────────────────────────────────────────────────────────

/**
 * Code Editor for advanced customization
@@ * 
@@ * @note Requires: npm install @monaco-editor/react
 */
// export const CodeEditor = dynamic(
//   () => import('@monaco-editor/react').then(mod => mod.default),
//   { loading: () => <div className="h-96 bg-gray-900 rounded animate-pulse" />, ssr: false }
// );

/**
 * Calendar for events & campaigns
@@ * 
@@ * @example Create component:
@@ * components/admin/Calendar.tsx
 */
// export const Calendar = dynamic(
//   () => import('@/components/admin/Calendar'),
//   { loading: () => <div className="h-96 bg-gray-100 rounded animate-pulse" />, ssr: false }
// );

// ── ACTIVE EXPORTS ───────────────────────────────────────────────────────────
// Only components that exist in the codebase

export const ActiveLazyComponents = {
  // Skeletons
  TableSkeleton,
  ChartSkeleton,
  FormSkeleton,
  CardSkeleton,
  
  // Charts (if react-chartjs-2 is installed)
  AdminCharts,
  
  // Existing components
  ExcelExporter,
  RichEditor,
  AnalyticsDashboard,
  MapEditor,
};

export default ActiveLazyComponents;
