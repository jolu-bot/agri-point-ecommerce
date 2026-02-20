// Static skeleton with fixed dimensions to prevent CLS
export function HeroImageSkeleton() {
  return (
    <div 
      className="aspect-square bg-[#0d1a0e] border border-emerald-900/30 flex items-center justify-center overflow-hidden rounded-2xl w-full"
      {...{
        style: {
          width: '100%',
          aspectRatio: '1 / 1',
          minHeight: '400px'
        }
      }}
    >
      {/* Shimmer animation */}
      <div className="w-full h-full bg-gradient-to-r from-emerald-950/50 via-emerald-900/20 to-emerald-950/50 animate-pulse" />
    </div>
  );
}
