export default function AdminSubLoading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-1/5 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
