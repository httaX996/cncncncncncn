import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getCurrentSeasonalTheme } from '../utils/seasonalThemes'

interface FallingItem {
  id: number
  emoji: string
  left: number
  duration: number
  delay: number
  rotation: number
  size: number
}

export const HalloweenTheme = () => {
  const { effectsEnabled } = useTheme()
  const [items, setItems] = useState<FallingItem[]>([])
  const [isHalloween, setIsHalloween] = useState(false)

  useEffect(() => {
    setIsHalloween(getCurrentSeasonalTheme() === 'halloween')
  }, [])

  useEffect(() => {
    if (!effectsEnabled || !isHalloween) return

    // Detect mobile device and reduce elements
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

    // Halloween elements
    const halloweenEmojis = ['🎃', '👻', '🦇', '🍂', '🍁', '🕷️']
    const itemCount = isMobile ? 6 : 15

    const newItems: FallingItem[] = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      emoji: halloweenEmojis[Math.floor(Math.random() * halloweenEmojis.length)],
      left: Math.random() * 100,
      duration: Math.random() * 10 + 15, // 15-25 seconds
      delay: Math.random() * 5,
      rotation: Math.random() * 360,
      size: Math.random() * 20 + 20 // 20-40px
    }))

    setItems(newItems)
  }, [effectsEnabled, isHalloween])

  if (!effectsEnabled || !isHalloween) return null

  return (
    <>
      {/* Falling Items */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-fall"
            style={{
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              transform: `rotate(${item.rotation}deg)`,
              top: '-50px'
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Spider Webs in Corners */}
      <div className="fixed top-0 left-0 pointer-events-none z-10">
        <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-20">
          <path
            d="M 0 0 Q 50 30 100 0 M 0 0 Q 30 50 0 100"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 20 0 Q 45 25 70 0 M 0 20 Q 25 45 0 70"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="fixed top-0 right-0 pointer-events-none z-10 transform scale-x-[-1]">
        <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-20">
          <path
            d="M 0 0 Q 50 30 100 0 M 0 0 Q 30 50 0 100"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 20 0 Q 45 25 70 0 M 0 20 Q 25 45 0 70"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Orange Glow Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.05), transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />

      {/* Add CSS animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(var(--rotation, 0deg));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(calc(var(--rotation, 0deg) + 720deg));
            opacity: 0;
          }
        }

        .animate-fall {
          animation: fall linear infinite;
          --rotation: 0deg;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

