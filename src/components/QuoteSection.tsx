import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const quotes = [
    { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather", year: "1972", image: "https://image.tmdb.org/t/p/w1280/mSDsSDwaP3E7dEfUPWy4J0djt4O.jpg" },
    { text: "May the Force be with you.", movie: "Star Wars", year: "1977", image: "https://image.tmdb.org/t/p/w1280/4qC1maUv5WapUPvIr0xdq42UG5f.jpg" },
    { text: "There's no place like home.", movie: "The Wizard of Oz", year: "1939", image: "https://image.tmdb.org/t/p/w1280/bCj4EPUh1N44gY048Wspk9Z4dbE.jpg" },
    { text: "I feel the need—the need for speed!", movie: "Top Gun", year: "1986", image: "https://image.tmdb.org/t/p/w1280/jIHIc6M7V5pZ5Yj2z0jX5jZ5j5.jpg" },
    { text: "Carpe diem. Seize the day, boys. Make your lives extraordinary.", movie: "Dead Poets Society", year: "1989", image: "https://image.tmdb.org/t/p/w1280/3W0v956XxSG5xgm7LB6qu8ExYJ2.jpg" },
    { text: "Just keep swimming.", movie: "Finding Nemo", year: "2003", image: "https://image.tmdb.org/t/p/w1280/3omFr6j53t6r8kF6r5f6.jpg" },
    { text: "To infinity and beyond!", movie: "Toy Story", year: "1995", image: "https://image.tmdb.org/t/p/w1280/lxD5ak7BOgou25n2u7o0o2k2.jpg" },
    { text: "Why so serious?", movie: "The Dark Knight", year: "2008", image: "https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg" },
    { text: "I see dead people.", movie: "The Sixth Sense", year: "1999", image: "https://image.tmdb.org/t/p/w1280/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { text: "Here's looking at you, kid.", movie: "Casablanca", year: "1942", image: "https://image.tmdb.org/t/p/w1280/5K7cFA3yqi1932NuO2sL75SoAnn.jpg" },
    { text: "You're gonna need a bigger boat.", movie: "Jaws", year: "1975", image: "https://image.tmdb.org/t/p/w1280/s2bT29y0ngXxxu2IA8AOzzXTRn7.jpg" },
    { text: "I'll be back.", movie: "The Terminator", year: "1984", image: "https://image.tmdb.org/t/p/w1280/qvktm0BHcnmDpul4Hz01GIazWPr.jpg" },
    { text: "My precious.", movie: "The Lord of the Rings: The Two Towers", year: "2002", image: "https://image.tmdb.org/t/p/w1280/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg" },
    { text: "Houston, we have a problem.", movie: "Apollo 13", year: "1995", image: "https://image.tmdb.org/t/p/w1280/oYCYVxUza6F8hAAeFlYhE7qJ2s5.jpg" },
    { text: "There's no crying in baseball!", movie: "A League of Their Own", year: "1992", image: "https://image.tmdb.org/t/p/w1280/6h5t25y2t0q9y2t0q9y2t0q9y2.jpg" },
    { text: "E.T. phone home.", movie: "E.T. the Extra-Terrestrial", year: "1982", image: "https://image.tmdb.org/t/p/w1280/qAM7kZ10aM2Z10aM2Z10aM2Z10.jpg" },
    { text: "You can't handle the truth!", movie: "A Few Good Men", year: "1992", image: "https://image.tmdb.org/t/p/w1280/r1x5J5x5J5x5J5x5J5x5J5x5.jpg" },
    { text: "A martini. Shaken, not stirred.", movie: "Goldfinger", year: "1964", image: "https://image.tmdb.org/t/p/w1280/d1x5J5x5J5x5J5x5J5x5J5x5.jpg" },
    { text: "Life is like a box of chocolates.", movie: "Forrest Gump", year: "1994", image: "https://image.tmdb.org/t/p/w1280/h5J4W4g4g4g4g4g4g4g4g4g4.jpg" },
    { text: "I am your father.", movie: "Star Wars: The Empire Strikes Back", year: "1980", image: "https://image.tmdb.org/t/p/w1280/7BuH8itoZXdETISXAFh84d1lfTS.jpg" },
]

export const QuoteSection = () => {
    const [quote, setQuote] = useState(quotes[0])
    const ref = useRef(null)

    // Parallax Effect
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    useEffect(() => {
        // Random quote on mount
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setQuote(randomQuote)
    }, [])

    return (
        <div ref={ref} className="relative h-[400px] md:h-[500px] my-16 rounded-3xl overflow-hidden flex items-center justify-center text-center px-4 group isolate transform-gpu">
            {/* Parallax Background */}
            <motion.div
                className="absolute inset-0 w-full h-[140%] -top-[20%] will-change-transform"
                style={{
                    y,
                    backgroundImage: `url(${quote.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 max-w-4xl"
            >
                <p className="text-3xl md:text-5xl font-serif italic text-white mb-8 leading-relaxed drop-shadow-2xl">
                    "{quote.text}"
                </p>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 font-bold uppercase tracking-[0.2em] text-sm md:text-base">
                        {quote.movie}
                    </p>
                    <span className="text-gray-400 text-xs font-mono border border-gray-700 px-2 py-1 rounded-full">
                        {quote.year}
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
