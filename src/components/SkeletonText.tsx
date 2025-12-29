interface SkeletonTextProps {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 3, className = '' }: SkeletonTextProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-700/50 rounded shimmer ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

