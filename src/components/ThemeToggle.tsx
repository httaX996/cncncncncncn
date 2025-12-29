import { useState } from 'react'
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)

  const themes = [
    { value: 'dark' as const, icon: FaMoon, label: 'Dark' },
    { value: 'light' as const, icon: FaSun, label: 'Light' },
    { value: 'auto' as const, icon: FaDesktop, label: 'Auto' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 md:p-2.5 rounded-lg glass-effect hover:bg-white/20 transition-all duration-300 
                   active:scale-95 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="text-lg md:text-xl" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-36 glass-effect rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-up">
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value)
                  setShowDropdown(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3 ${
                  theme === value ? 'bg-white/5' : ''
                }`}
              >
                <Icon className={theme === value ? 'text-primary' : ''} />
                <span className="font-medium">{label}</span>
                {theme === value && (
                  <span className="ml-auto text-primary text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

