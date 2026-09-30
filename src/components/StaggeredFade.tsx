import { motion } from 'framer-motion'

interface StaggeredFadeProps {
  text: string
  className?: string
}

/**
 * Splits text into individual characters and reveals them one by one.
 * Animates only once, when scrolled into view.
 */
export default function StaggeredFade({ text, className }: StaggeredFadeProps) {
  const characters = text.split('')

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.07 }}
      aria-label={text}
    >
      {characters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}
