import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaSearch, FaCompass } from 'react-icons/fa'
import { motion } from 'framer-motion'

export const MobileNav = () => {
    const location = useLocation()
    const { pathname } = location

    const navItems = [
        { icon: FaHome, label: 'Home', path: '/' },
        { icon: FaCompass, label: 'Browse', path: '/browse' },
        { icon: FaSearch, label: 'Search', path: '/search' },
        // { icon: FaUser, label: 'My List', path: '/my-list' }, // Uncomment if My List is ready
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="glass-panel pb-safe pt-2 px-6 flex justify-between items-center rounded-t-2xl border-t border-white/10">
                {navItems.map((item) => {
                    const isActive = pathname === item.path
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center py-2 w-16 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}

                            <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                                }`}>
                                <Icon className={`text-xl mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'
                                    }`} />
                            </div>

                            <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
