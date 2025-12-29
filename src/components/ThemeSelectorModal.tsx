import { FaTimes, FaCheck } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { colorThemes, type ColorTheme } from '../config/themes'

interface ThemeSelectorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ThemeSelectorModal = ({ isOpen, onClose }: ThemeSelectorModalProps) => {
  const { colorTheme, setColorTheme } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-effect rounded-2xl p-6 md:p-8 max-w-2xl w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gradient">Choose Your Theme</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Close"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {(Object.entries(colorThemes) as [ColorTheme, typeof colorThemes[ColorTheme]][]).map(([key, theme]) => {
            const isSelected = colorTheme === key

            return (
              <button
                key={key}
                onClick={() => setColorTheme(key)}
                className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 
                           hover:scale-105 active:scale-95 ${
                             isSelected
                               ? 'border-white/50 shadow-lg'
                               : 'border-white/10 hover:border-white/30'
                           }`}
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`
                }}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <FaCheck className="text-gray-900 text-xs" />
                  </div>
                )}

                {/* Theme Info */}
                <div className="text-white text-left">
                  <h3 className="font-bold text-lg md:text-xl mb-1">{theme.name}</h3>
                  <p className="text-xs md:text-sm opacity-90">{theme.description}</p>
                </div>

                {/* Color Preview Dots */}
                <div className="flex space-x-2 mt-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: theme.primaryDark }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Your theme preference is saved automatically
        </p>
      </div>
    </div>
  )
}

