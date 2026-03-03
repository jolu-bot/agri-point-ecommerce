/**
 * Premium Loading State - Analytics Dashboard
 */

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-96" />
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-4">
        <div className="h-10 bg-gray-100 rounded w-48" />
        <div className="h-10 bg-gray-100 rounded w-32" />
        <div className="h-10 bg-blue-100 rounded w-40" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
            </div>
            <div className="h-10 bg-gray-300 rounded w-32 mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-4 bg-green-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="h-80 bg-gradient-to-t from-gray-50 to-gray-100 rounded" />
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="h-80 bg-gradient-to-t from-gray-50 to-gray-100 rounded" />
        </div>
      </div>

      {/* Products & Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
