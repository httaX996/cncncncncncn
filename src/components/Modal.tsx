import { useEffect, ReactNode } from 'react'
import { FaTimes } from 'react-icons/fa'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] glass-effect rounded-lg sm:rounded-2xl 
                   overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
            <h2 id="modal-title" className="text-base sm:text-lg md:text-xl font-bold line-clamp-1 pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all flex-shrink-0"
              aria-label="Close modal"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-4rem)] sm:max-h-[calc(90vh-4rem)]">
          {children}
        </div>

        {/* Close button for modals without title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 glass-effect hover:bg-white/20 active:scale-95
                     rounded-full transition-all z-10"
            aria-label="Close modal"
          >
            <FaTimes className="text-lg" />
          </button>
        )}
      </div>
    </div>
  )
}

