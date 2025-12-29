/**
 * Utility functions for device detection and performance optimization
 */

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth < 768
}

export const isLowEndDevice = (): boolean => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // Check for low-end device indicators
  const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false
  const isSlowConnection = (navigator as any).connection ? 
    ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType) : false
  
  return prefersReducedMotion || isLowMemory || isSlowConnection
}

export const getOptimalImageSize = (baseSize: 'w342' | 'w500' | 'w780' | 'original'): string => {
  if (isMobileDevice()) {
    // Use smaller images on mobile
    if (baseSize === 'w780' || baseSize === 'original') return 'w500'
    if (baseSize === 'w500') return 'w342'
  }
  return baseSize
}

export const getOptimalParticleCount = (defaultCount: number): number => {
  if (isLowEndDevice()) return Math.floor(defaultCount * 0.3)
  if (isMobileDevice()) return Math.floor(defaultCount * 0.5)
  return defaultCount
}

export const getOptimalFPS = (): number => {
  if (isLowEndDevice()) return 24
  if (isMobileDevice()) return 30
  return 60
}

