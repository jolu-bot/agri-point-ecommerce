export default function ReviewsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-48 mb-6 animate-pulse" />
      <div className="flex gap-3 mb-6">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-48 animate-pulse" />
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-64 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
