export default function NewsletterAdminLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-40 mb-6 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
    </div>
  );
}
