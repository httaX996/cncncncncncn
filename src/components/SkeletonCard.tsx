export const SkeletonCard = () => {
  return (
    <div className="relative block rounded-lg md:rounded-xl overflow-hidden bg-gray-800/50 animate-pulse">
      {/* Poster Skeleton */}
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-700/50">
        <div className="absolute inset-0 shimmer" />
      </div>
      
      {/* Info Overlay Skeleton */}
      <div className="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Title */}
        <div className="h-3 md:h-4 bg-gray-600/50 rounded w-3/4 mb-1.5 md:mb-2 shimmer" />
        
        {/* Year and Rating */}
        <div className="flex items-center justify-between">
          <div className="h-2 md:h-3 bg-gray-600/50 rounded w-12 shimmer" />
          <div className="h-2 md:h-3 bg-gray-600/50 rounded w-8 shimmer" />
        </div>
      </div>
    </div>
  )
}

