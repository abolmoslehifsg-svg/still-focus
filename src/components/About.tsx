import { motion } from 'framer-motion'
import { useI18n } from '../i18n/context'

const TELEGRAM_URL = 'https://t.me/tenmanogod'

/**
 * Minimal credit block. Deliberately short — no pitch, no filler.
 */
export default function About() {
  const { t } = useI18n()

  return (
    <motion.section
      id="about"
      className="relative z-10 flex w-full flex-col items-center px-5 pb-24 pt-10 text-center sm:pt-16"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      aria-label="About"
    >
      <div className="liquid-glass flex flex-col items-center gap-3 rounded-2xl px-10 py-9 sm:px-16 sm:py-11">
        <h2 className="font-garamond text-2xl font-normal text-white sm:text-3xl">
          {t('about.developedBy')}
        </h2>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
          className="text-[11px] uppercase tracking-[0.3em] text-white/55 transition-colors duration-300 hover:text-white sm:text-xs"
        >
          @tenmanogod
        </a>
      </div>
    </motion.section>
  )
}
