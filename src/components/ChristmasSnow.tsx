import { useEffect, useState } from 'react'

export const ChristmasSnow = () => {
    const [snowflakes, setSnowflakes] = useState<number[]>([])

    useEffect(() => {
        // Create a fixed number of snowflakes for performance
        const count = 50
        setSnowflakes(Array.from({ length: count }, (_, i) => i))
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
            {snowflakes.map((i) => (
                <div
                    key={i}
                    className="absolute text-white opacity-80 animate-snowfall"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20 + 10}%`,
                        animationDuration: `${Math.random() * 5 + 5}s`, // 5-10s duration
                        animationDelay: `${Math.random() * 5}s`,
                        fontSize: `${Math.random() * 10 + 10}px`, // 10-20px size
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    )
}
