// Static skeleton with fixed dimensions to prevent CLS
export function HeroImageSkeleton() {
  return (
    <div 
      className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden rounded-2xl w-full"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        minHeight: '400px'
      }}
    >
      {/* Shimmer animation */}
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
    </div>
  );
}
