export default function CampaignInscriptionsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-64 mb-6 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );
}
