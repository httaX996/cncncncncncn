import { FaTimes, FaCheck, FaMoon, FaSun, FaDesktop, FaPalette } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { colorThemes, type ColorTheme } from '../config/themes'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { theme, setTheme, colorTheme, setColorTheme, seasonalEnabled, setSeasonalEnabled } = useTheme()

    if (!isOpen) return null

    const appearanceOptions = [
        { value: 'dark', icon: FaMoon, label: 'Dark' },
        { value: 'light', icon: FaSun, label: 'Light' },
        { value: 'auto', icon: FaDesktop, label: 'Auto' },
    ] as const

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-effect rounded-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-2xl font-bold text-gradient">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                        aria-label="Close settings"
                    >
                        <FaTimes className="text-xl text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* Appearance Section */}
                    <section>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <FaDesktop className="text-primary text-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Appearance</h3>
                                <p className="text-sm text-gray-400">Customize how SanuFlix looks</p>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-xl p-1.5 flex space-x-1">
                            {appearanceOptions.map((option) => {
                                const Icon = option.icon
                                const isActive = theme === option.value
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setTheme(option.value)}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 ${isActive
                                            ? 'bg-white/10 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={isActive ? 'text-primary' : ''} />
                                        <span className="font-medium">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Seasonal Theme Section */}
                    <section>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <span className="text-lg">🎄</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Seasonal Theme</h3>
                                <p className="text-sm text-gray-400">Enable festive decorations and colors</p>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${seasonalEnabled ? 'bg-red-600' : 'bg-gray-700'}`}>
                                    <span className="text-xl">🎅</span>
                                </div>
                                <div>
                                    <div className="font-medium text-white">Christmas Mode</div>
                                    <div className="text-xs text-gray-400">Snow, lights, and holiday cheer</div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSeasonalEnabled(!seasonalEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${seasonalEnabled ? 'bg-primary' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${seasonalEnabled ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </section>

                    {/* Color Theme Section */}
                    <section>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <FaPalette className="text-primary text-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Color Theme</h3>
                                <p className="text-sm text-gray-400">Choose your accent color</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {(Object.entries(colorThemes) as [ColorTheme, typeof colorThemes[ColorTheme]][]).map(([key, themeOption]) => {
                                const isSelected = colorTheme === key

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setColorTheme(key)}
                                        className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                               hover:scale-[1.02] active:scale-95 ${isSelected
                                                ? 'border-primary bg-white/5'
                                                : 'border-white/5 hover:border-white/20 bg-black/20'
                                            }`}
                                    >
                                        {/* Gradient Preview */}
                                        <div
                                            className="h-20 rounded-lg mb-3 w-full shadow-inner"
                                            style={{
                                                background: `linear-gradient(135deg, ${themeOption.gradientStart} 0%, ${themeOption.gradientEnd} 100%)`
                                            }}
                                        />

                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                                {themeOption.name}
                                            </span>
                                            {isSelected && (
                                                <div className="bg-primary rounded-full p-1">
                                                    <FaCheck className="text-white text-[10px]" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 text-center">
                    <p className="text-sm text-gray-500">
                        SanuFlix v2.0.0 • Made with ❤️
                    </p>
                </div>
            </div>
        </div>
    )
}
