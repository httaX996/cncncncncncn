import { FaStar } from 'react-icons/fa'
import { formatNumber } from '../utils/formatters'

interface RatingDisplayProps {
  rating: number
  voteCount: number
  size?: 'small' | 'medium' | 'large'
  showVoteCount?: boolean
}

export const RatingDisplay = ({ 
  rating, 
  voteCount, 
  size = 'medium',
  showVoteCount = true 
}: RatingDisplayProps) => {
  // Color coding based on rating
  const getRatingColor = (rating: number): string => {
    if (rating >= 7) return 'text-green-400'
    if (rating >= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Size configurations
  const sizeClasses = {
    small: {
      container: 'text-xs',
      star: 'text-[10px]',
      rating: 'text-xs',
      votes: 'text-[9px]'
    },
    medium: {
      container: 'text-sm',
      star: 'text-xs',
      rating: 'text-sm',
      votes: 'text-xs'
    },
    large: {
      container: 'text-lg',
      star: 'text-base',
      rating: 'text-2xl',
      votes: 'text-sm'
    }
  }

  const classes = sizeClasses[size]
  const ratingColor = getRatingColor(rating)

  if (size === 'large') {
    return (
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center space-x-2">
          <FaStar className={`${classes.star} ${ratingColor}`} />
          <span className={`${classes.rating} font-bold ${ratingColor}`}>
            {rating.toFixed(1)}
          </span>
          <span className="text-gray-400 text-base">/</span>
          <span className="text-gray-400 text-base">10</span>
        </div>
        {showVoteCount && voteCount > 0 && (
          <div className={`${classes.votes} text-gray-400`}>
            {formatNumber(voteCount)} votes
          </div>
        )}
        {/* Progress bar */}
        <div className="w-full max-w-[200px] h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${ratingColor.replace('text', 'bg')} transition-all duration-500`}
            style={{ width: `${(rating / 10) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center space-x-1 ${classes.container}`}
      title={showVoteCount && voteCount > 0 ? `${formatNumber(voteCount)} votes` : undefined}
    >
      <FaStar className={`${classes.star} ${ratingColor}`} />
      <span className={`${classes.rating} font-semibold`}>
        {rating.toFixed(1)}
      </span>
      {showVoteCount && voteCount > 0 && size === 'medium' && (
        <span className={`${classes.votes} text-gray-400`}>
          ({formatNumber(voteCount)})
        </span>
      )}
    </div>
  )
}

