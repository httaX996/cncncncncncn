import { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa'

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 md:p-4 bg-gradient-primary rounded-full
                   shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/70
                   transform hover:scale-110 active:scale-95 transition-all duration-300
                   group animate-fade-in"
          aria-label="Back to top"
        >
          <FaArrowUp className="text-white text-lg md:text-xl group-hover:animate-bounce" />
        </button>
      )}
    </>
  )
}

