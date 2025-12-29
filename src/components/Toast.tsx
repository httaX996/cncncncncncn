import { useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  onClose: (id: string) => void
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  const icons = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    info: FaInfoCircle,
  }

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-pink-500',
    info: 'from-blue-500 to-cyan-500',
  }

  const Icon = icons[type]
  const colorGradient = colors[type]

  return (
    <div
      className={`flex items-center space-x-3 p-4 rounded-lg shadow-lg backdrop-blur-md
                 bg-gradient-to-r ${colorGradient} text-white min-w-[280px] max-w-md
                 animate-slide-in-right`}
    >
      <Icon className="text-xl flex-shrink-0" />
      <p className="flex-1 text-sm md:text-base font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <FaTimes />
      </button>
    </div>
  )
}

