interface LoadingSpinnerProps {
  className?: string
}

export const LoadingSpinner = ({ className = '' }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`} role="status" aria-live="polite">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full 
                      absolute top-0 left-0 animate-spin" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

