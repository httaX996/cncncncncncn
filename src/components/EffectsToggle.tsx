import { useState } from 'react'
import { FaMagic, FaBan } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'

export const EffectsToggle = () => {
  const { effectsEnabled, setEffectsEnabled } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setEffectsEnabled(!effectsEnabled)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`fixed bottom-20 md:bottom-24 left-4 md:left-8 z-40 p-3 md:p-4 rounded-full 
                    shadow-lg transition-all duration-300 ease-in-out active:scale-90 ${
                      effectsEnabled
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
        aria-label={effectsEnabled ? 'Disable effects' : 'Enable effects'}
      >
        {effectsEnabled ? (
          <FaMagic className="text-lg md:text-xl" />
        ) : (
          <FaBan className="text-lg md:text-xl" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-36 md:bottom-40 left-4 md:left-8 z-50 
                        glass-effect rounded-lg px-3 py-2 text-sm whitespace-nowrap animate-fade-in">
          {effectsEnabled ? 'Disable animations' : 'Enable animations'}
        </div>
      )}
    </div>
  )
}

