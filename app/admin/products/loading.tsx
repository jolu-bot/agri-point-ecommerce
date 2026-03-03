/**
 * Premium Loading State - Products Management
 */

export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-96" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-100 rounded w-40" />
          <div className="h-10 bg-blue-100 rounded w-48" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total produits', 'En stock', 'Stock faible', 'Rupture'].map((label, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="w-10 h-10 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-8 bg-gray-300 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded w-32" />
          <div className="h-10 bg-gray-100 rounded w-32" />
          <div className="h-10 bg-gray-100 rounded w-40" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
            
            {/* Product Info */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              
              {/* Price & Stock */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-green-100 rounded w-16" />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <div className="flex-1 h-9 bg-gray-100 rounded" />
                <div className="h-9 w-9 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
