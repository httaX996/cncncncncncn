export const SkeletonHero = () => {
  return (
    <section className="relative h-[70vh] sm:h-[80vh] md:h-screen w-full overflow-hidden bg-gray-900" aria-label="Loading featured content">
      {/* Background Skeleton */}
      <div className="absolute inset-0 bg-gray-800/50">
        <div className="absolute inset-0 shimmer" />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content Skeleton */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center pb-20 sm:pb-0">
        <div className="max-w-2xl space-y-4 md:space-y-6">
          {/* Title Skeleton */}
          <div className="space-y-2 md:space-y-3">
            <div className="h-8 sm:h-10 md:h-14 bg-gray-700/50 rounded w-full shimmer" />
            <div className="h-8 sm:h-10 md:h-14 bg-gray-700/50 rounded w-3/4 shimmer" />
          </div>
          
          {/* Metadata Skeleton */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="h-6 md:h-8 w-16 bg-gray-700/50 rounded-full shimmer" />
            <div className="h-6 md:h-8 w-12 bg-gray-700/50 rounded shimmer" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 md:h-5 bg-gray-700/50 rounded w-full shimmer" />
            <div className="h-4 md:h-5 bg-gray-700/50 rounded w-full shimmer" />
            <div className="h-4 md:h-5 bg-gray-700/50 rounded w-2/3 shimmer" />
          </div>

          {/* Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="h-10 md:h-12 w-full sm:w-40 bg-gray-700/50 rounded-lg shimmer" />
            <div className="h-10 md:h-12 w-full sm:w-40 bg-gray-700/50 rounded-lg shimmer" />
          </div>

          {/* Indicators Skeleton */}
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1 w-4 md:w-6 bg-gray-700/50 rounded-full shimmer" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

