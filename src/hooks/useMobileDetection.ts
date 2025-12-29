import { useState, useEffect } from 'react'

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    
    // Check user agent and screen width
    const userAgent = navigator.userAgent
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isMobileScreen = window.innerWidth < 768
    
    return isMobileUserAgent || isMobileScreen
  })

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isMobileScreen = window.innerWidth < 768
      
      setIsMobile(isMobileUserAgent || isMobileScreen)
    }

    // Check on mount and resize
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Enhanced mobile detection with performance considerations
export const useMobilePerformance = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Check for low-end device indicators
    const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false
    const isSlowConnection = (navigator as any).connection ? 
      ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType) : false
    
    return prefersReducedMotion || isLowMemory || isSlowConnection
  })

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    
    const userAgent = navigator.userAgent
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isMobileScreen = window.innerWidth < 768
    
    return isMobileUserAgent || isMobileScreen
  })

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isMobileScreen = window.innerWidth < 768
      
      setIsMobile(isMobileUserAgent || isMobileScreen)
      
      // Check for low-end device indicators
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isLowMemory = (navigator as any).deviceMemory ? (navigator as any).deviceMemory < 4 : false
      const isSlowConnection = (navigator as any).connection ? 
        ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType) : false
      
      setIsLowEndDevice(prefersReducedMotion || isLowMemory || isSlowConnection)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return { isMobile, isLowEndDevice }
}
