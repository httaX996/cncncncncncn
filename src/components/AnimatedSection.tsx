import { motion } from 'framer-motion'

interface AnimatedSectionProps {
    children: React.ReactNode
    className?: string
    delay?: number
}

export const AnimatedSection = ({ children, className = '', delay = 0 }: AnimatedSectionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px", amount: 0.1 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    )
}
