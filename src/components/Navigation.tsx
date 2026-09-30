import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const LINKS = ['Focus', 'Sounds', 'About'] as const

interface NavigationProps {
  /** When true the nav fades toward near-zero opacity (focus mode). */
  dimmed: boolean
}

export default function Navigation({ dimmed }: NavigationProps) {
  const [open, setOpen] = useState(false)

  return (
    <motion.nav
      className="relative z-20 flex w-full items-center justify-between px-5 py-5 sm:px-8 md:py-7"
      animate={{ opacity: dimmed ? 0.08 : 1 }}
      transition={{ duration: 1.6, ease: 'easeInOut' }}
      aria-label="Main"
    >
      <a
        href="#focus"
        className="font-garamond text-sm uppercase text-white tracking-[0.25em] font-light transition-opacity duration-300 hover:opacity-100 sm:tracking-[0.3em] md:text-base"
      >
        Still
      </a>

      {/* Desktop links */}
      <div className="hidden items-center gap-10 md:flex">
        {LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-light transition-all duration-300 hover:text-white"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white/90 md:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <Menu size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu-glass fixed left-4 right-4 top-16 z-50 flex flex-col items-center gap-5 rounded-2xl py-8 md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {LINKS.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-white/80 font-light transition-colors duration-300 hover:text-white"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  delay: 0.05 + i * 0.06,
                }}
              >
                {link}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    )
}
