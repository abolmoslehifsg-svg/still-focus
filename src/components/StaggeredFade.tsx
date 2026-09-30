import { motion } from 'framer-motion'

interface StaggeredFadeProps {
  text: string
  className?: string
}

/**
 * Reveals text word by word. Splitting on words (not characters) keeps the
 * letters inside each word joined — important for cursive scripts like Persian
 * and Arabic, where isolated letters render in the wrong, disconnected form.
 * Animates only once, when scrolled into view.
 */
export default function StaggeredFade({ text, className }: StaggeredFadeProps) {
  // Keep the whitespace between words so the sentence still breathes.
  const tokens = text.split(/(\s+)/)

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
      aria-label={text}
    >
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={`space-${i}`} aria-hidden="true">
            {token}
          </span>
        ) : (
          <motion.span
            key={`${token}-${i}`}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
            aria-hidden="true"
          >
            {token}
          </motion.span>
        ),
      )}
    </motion.span>
  )
}
