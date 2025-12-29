import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export const ChristmasDecorations = () => {
    const { seasonalEnabled, effectsEnabled } = useTheme()
    const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; animationDuration: number; opacity: number }>>([])

    // Snow logic
    useEffect(() => {
        if (seasonalEnabled && effectsEnabled) {
            // Generate snowflakes
            const flakes = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                animationDuration: Math.random() * 3 + 2, // 2-5 seconds
                opacity: Math.random() * 0.5 + 0.3
            }))
            setSnowflakes(flakes)
        } else {
            setSnowflakes([])
        }
    }, [seasonalEnabled, effectsEnabled])

    if (!seasonalEnabled) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
            {/* Snowflakes (only if effectsEnabled) */}
            {effectsEnabled && snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-10px] bg-white rounded-full animate-snow"
                    style={{
                        left: `${flake.left}%`,
                        width: '4px',
                        height: '4px',
                        opacity: flake.opacity,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}

            {/* Top Garland / Lights */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-4 pointer-events-none">
                {/* Left Corner Decoration */}
                <div className="w-40 h-40 bg-contain bg-no-repeat opacity-90 drop-shadow-lg transform -translate-x-4 -translate-y-4"
                    style={{ backgroundImage: 'url("https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Christmas%20tree/3D/christmas_tree_3d.png")' }} />

                {/* String of Lights (CSS) */}
                <div className="flex-1 h-8 mx-4 flex justify-around items-start pt-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i}
                            className={`w-3 h-3 rounded-full shadow-lg ${i % 2 === 0 ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'} 
                                        ${effectsEnabled ? 'animate-pulse' : ''}`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>

                {/* Right Corner Decoration */}
                <div className="w-40 h-40 bg-contain bg-no-repeat opacity-90 drop-shadow-lg transform translate-x-4 -translate-y-4 scale-x-[-1]"
                    style={{ backgroundImage: 'url("https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Christmas%20tree/3D/christmas_tree_3d.png")' }} />
            </div>

            {/* Bottom Lights (CSS Gradient) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500 opacity-50 blur-sm" />
        </div>
    )
}
