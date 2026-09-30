import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LOCALES } from '../i18n/messages'
import { useI18n } from '../i18n/context'

interface NavigationProps {
  /** When true the nav fades toward near-zero opacity (focus mode). */
  dimmed: boolean
}

export default function Navigation({ dimmed }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const { t, locale, toggle } = useI18n()
  const links = [
    { label: t('nav.focus'), href: '#focus' },
    { label: t('nav.sounds'), href: '#sounds' },
    { label: t('nav.progress'), href: '#progress' },
    { label: t('nav.about'), href: '#about' },
  ]

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
        {t('nav.brand')}
      </a>

      {/* Desktop links */}
      <div className="hidden items-center gap-10 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-light transition-all duration-300 hover:text-white"
          >
            {link.label}
          </a>
        ))}

        <button
          type="button"
          onClick={toggle}
          className="liquid-glass rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:text-white"
          aria-label={LOCALES[locale === 'en' ? 'fa' : 'en'].name}
          title={LOCALES[locale === 'en' ? 'fa' : 'en'].name}
        >
          {LOCALES[locale === 'en' ? 'fa' : 'en'].label}
        </button>
      </div>

      {/* Mobile: language toggle + hamburger */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          type="button"
          onClick={toggle}
          className="liquid-glass flex h-10 items-center justify-center rounded-full px-3.5 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:text-white"
          aria-label={LOCALES[locale === 'en' ? 'fa' : 'en'].name}
          title={LOCALES[locale === 'en' ? 'fa' : 'en'].name}
        >
          {LOCALES[locale === 'en' ? 'fa' : 'en'].label}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white/90 md:hidden"
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
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
      </div>

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
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
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
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    )
}
