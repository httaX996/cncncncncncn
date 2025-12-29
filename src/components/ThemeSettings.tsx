import { useState } from 'react'
import { FaPalette } from 'react-icons/fa'
import { ThemeSelectorModal } from './ThemeSelectorModal'

export const ThemeSettings = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 md:p-2.5 rounded-lg glass-effect hover:bg-white/20 transition-all duration-300 
                   active:scale-95 flex items-center justify-center"
        aria-label="Choose color theme"
      >
        <FaPalette className="text-lg md:text-xl" />
      </button>

      <ThemeSelectorModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

