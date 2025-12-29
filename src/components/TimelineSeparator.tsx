interface TimelineSeparatorProps {
  year: number | string
}

export const TimelineSeparator = ({ year }: TimelineSeparatorProps) => {
  return (
    <div className="sticky top-16 md:top-20 z-20 py-3 md:py-4 mb-4 md:mb-6 
                    backdrop-blur-md bg-gradient-to-r from-transparent via-black/80 to-transparent">
      <div className="flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/50" />
        <h3 className="px-4 md:px-6 text-xl md:text-2xl font-bold text-gradient">
          {year}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/50" />
      </div>
    </div>
  )
}

