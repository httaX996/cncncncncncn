import type { Award } from '../utils/awardDetection'

interface AwardBadgeProps {
  award: Award
  size?: 'small' | 'medium'
}

export const AwardBadge = ({ award, size = 'small' }: AwardBadgeProps) => {
  const sizeClasses = {
    small: {
      container: 'px-1.5 py-0.5 text-[9px] md:text-[10px]',
      icon: 'text-[10px] md:text-xs'
    },
    medium: {
      container: 'px-2 py-1 text-xs md:text-sm',
      icon: 'text-sm md:text-base'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div 
      className={`inline-flex items-center space-x-1 rounded-full backdrop-blur-md
                  border transition-all duration-300 font-bold shadow-lg ${classes.container}`}
      style={{ 
        backgroundColor: `${award.color}20`,
        borderColor: award.color,
        color: award.color
      }}
      title={award.label}
    >
      <span className={classes.icon}>{award.icon}</span>
      <span className="hidden sm:inline">{award.label.split(' ')[0]}</span>
    </div>
  )
}

