import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export const CustomCursor = () => {
    const { effectsEnabled } = useTheme()
    const [isHoveringClickable, setIsHoveringClickable] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Only enable on non-touch devices and if effects are enabled
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        if (isTouchDevice || !effectsEnabled) {
            setIsVisible(false)
            document.body.style.cursor = 'auto'
            document.body.classList.remove('custom-cursor')
            return
        }

        setIsVisible(true)
        document.body.style.cursor = 'none'
        document.body.classList.add('custom-cursor')

        let rafId: number

        const handleMouseMove = (e: MouseEvent) => {
            // Use requestAnimationFrame for smooth updates without React render cycle overhead
            if (rafId) cancelAnimationFrame(rafId)

            rafId = requestAnimationFrame(() => {
                if (cursorRef.current) {
                    cursorRef.current.style.left = `${e.clientX}px`
                    cursorRef.current.style.top = `${e.clientY}px`
                }

                // Check clickable status
                const target = e.target as HTMLElement
                const isClickable =
                    target.tagName === 'BUTTON' ||
                    target.tagName === 'A' ||
                    target.closest('button') ||
                    target.closest('a') ||
                    target.getAttribute('role') === 'button' ||
                    target.classList.contains('clickable')

                setIsHoveringClickable(!!isClickable)
            })
        }

        const handleMouseLeave = () => setIsVisible(false)
        const handleMouseEnter = () => setIsVisible(true)

        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        document.addEventListener('mouseleave', handleMouseLeave)
        document.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            window.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mouseenter', handleMouseEnter)
            document.body.style.cursor = 'auto'
            document.body.classList.remove('custom-cursor')
        }
    }, [effectsEnabled])

    if (!isVisible) return null

    return (
        <div
            ref={cursorRef}
            className="fixed pointer-events-none z-[10000] flex items-center justify-center will-change-transform"
            style={{
                left: -100, // Initial off-screen
                top: -100,
                transform: `translate(-50%, -50%) scale(${isHoveringClickable ? 1.5 : 1})`,
                transition: 'transform 0.15s ease-out', // Only animate scale, not position
            }}
        >
            {/* Main Cursor Ball */}
            <div
                className="w-4 h-4 rounded-full bg-primary transition-all duration-200"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 0 15px var(--color-primary), 0 0 30px var(--color-primary)',
                }}
            />

            {/* Outer Ring (only visible when hovering) */}
            <div
                className={`absolute border-2 border-primary rounded-full transition-all duration-300 ${isHoveringClickable ? 'w-8 h-8 opacity-100' : 'w-0 h-0 opacity-0'}`}
                style={{ borderColor: 'var(--color-primary)' }}
            />
        </div>
    )
}
