import { useState, useRef, useEffect } from 'react'
import { FaShare, FaLink, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa'
import { useToast } from '../contexts/ToastContext'

interface ShareButtonProps {
  title: string
  text: string
  url: string
  className?: string
  children?: React.ReactNode
}

export const ShareButton = ({ title, text, url, className, children }: ShareButtonProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX
      })
    }
  }, [showMenu])
  const { showToast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success')
      setShowMenu(false)
    } catch (error) {
      showToast('Failed to copy link', 'error')
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setShowMenu(false)
      } catch (error) {
        // User cancelled or error
      }
    }
  }

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(fbUrl, '_blank', 'width=550,height=420')
    setShowMenu(false)
  }

  const shareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    window.open(waUrl, '_blank')
    setShowMenu(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, text, url })
            } catch (error) {
              // User cancelled or error, fallback to menu if needed, or just do nothing if cancelled
              if ((error as Error).name !== 'AbortError') {
                setShowMenu(!showMenu)
              }
            }
          } else {
            setShowMenu(!showMenu)
          }
        }}
        className={className || "px-4 md:px-6 py-2 md:py-3 glass-effect rounded-lg font-semibold text-sm md:text-base hover:bg-white/20 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2"}
        aria-label="Share"
      >
        {children || (
          <>
            <FaShare className="text-xs md:text-base" />
            <span>Share</span>
          </>
        )}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            className="fixed w-56 glass-effect rounded-lg shadow-2xl z-[9999] overflow-hidden animate-slide-up"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
          >
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={shareNative}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
              >
                <FaShare />
                <span>Share</span>
              </button>
            )}

            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
            >
              <FaLink />
              <span>Copy Link</span>
            </button>

            <button
              onClick={shareTwitter}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
            >
              <FaTwitter className="text-blue-400" />
              <span>Twitter</span>
            </button>

            <button
              onClick={shareFacebook}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
            >
              <FaFacebook className="text-blue-600" />
              <span>Facebook</span>
            </button>

            <button
              onClick={shareWhatsApp}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
            >
              <FaWhatsapp className="text-green-500" />
              <span>WhatsApp</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}

