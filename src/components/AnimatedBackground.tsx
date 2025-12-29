import { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { effectsEnabled } = useTheme()
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!effectsEnabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles (reduce significantly on mobile and low-end devices)
    const createParticles = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false
      
      let baseCount = 50
      if (isMobile) baseCount = 15
      if (prefersReducedMotion || isLowMemory) baseCount = 5
      
      const particleCount = Math.min(baseCount, Math.floor((window.innerWidth * window.innerHeight) / 15000))
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.5),
          vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.1 : 0.5),
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1
        })
      }
    }
    createParticles()

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop with FPS throttling on mobile and low-end devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false
    
    let targetFPS = 60
    if (isMobile) targetFPS = 30
    if (prefersReducedMotion || isLowMemory) targetFPS = 15
    
    const frameDelay = 1000 / targetFPS
    let lastFrameTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - lastFrameTime

      if (elapsed < frameDelay) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = now - (elapsed % frameDelay)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particlesRef.current.forEach((particle) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.vx -= (dx / distance) * force * 0.2
          particle.vy -= (dy / distance) * force * 0.2
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Damping
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.fill()

        // Draw connections
        particlesRef.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      } else {
        animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [effectsEnabled])

  if (!effectsEnabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  )
}

