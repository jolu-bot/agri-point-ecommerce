/**
 * PREMIUM Admin Loading State
 * Optimized skeleton for admin dashboard
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-300 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Action Bar Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-48" />
            <div className="h-10 bg-gray-100 rounded w-32" />
          </div>
          <div className="h-10 bg-blue-100 rounded w-40" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-6 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="flex gap-2">
              <div className="h-8 bg-gray-100 rounded w-8" />
              <div className="h-8 bg-gray-100 rounded w-8" />
              <div className="h-8 bg-gray-200 rounded w-8" />
              <div className="h-8 bg-gray-100 rounded w-8" />
              <div className="h-8 bg-gray-100 rounded w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating pulse indicator */}
      <div className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="h-2 w-2 bg-white rounded-full animate-ping" />
        <span className="text-sm font-medium">Chargement...</span>
      </div>
    </div>
  );
}
