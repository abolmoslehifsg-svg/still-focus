import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Download, Menu, Smartphone, X } from 'lucide-react'
import { LOCALES } from '../i18n/messages'
import { useI18n } from '../i18n/context'

const WINDOWS_DOWNLOAD_URL =
  'https://github.com/abolmoslehifsg-svg/still-focus/releases/latest/download/Still-Setup.exe'
const MOBILE_APP_URL = 'https://abolmoslehifsg-svg.github.io/still-focus/'

interface NavigationProps {
  /** When true the nav fades toward near-zero opacity (focus mode). */
  dimmed: boolean
}

export default function Navigation({ dimmed }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
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
      animate={{ opacity: dimmed ? 0.035 : 1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      style={{ pointerEvents: dimmed ? 'none' : 'auto' }}
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

        <div
          className="relative"
          onMouseEnter={() => setDownloadOpen(true)}
          onMouseLeave={() => setDownloadOpen(false)}
          onFocus={() => setDownloadOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setDownloadOpen(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setDownloadOpen(false)
          }}
        >
          <button
            type="button"
            onClick={() => setDownloadOpen((value) => !value)}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-white/85 transition-colors duration-300 hover:text-white"
            aria-expanded={downloadOpen}
            aria-haspopup="true"
          >
            <Download size={14} aria-hidden="true" />
            {t('nav.downloads')}
            <ChevronDown size={13} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {downloadOpen && (
              <motion.div
                className="liquid-glass absolute right-0 top-full z-50 flex min-w-52 flex-col gap-1 rounded-xl p-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
              >
                <a
                  href={WINDOWS_DOWNLOAD_URL}
                  onClick={() => setDownloadOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download size={15} aria-hidden="true" />
                  {t('nav.downloadPc')}
                </a>
                <a
                  href={MOBILE_APP_URL}
                  onClick={() => setDownloadOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Smartphone size={15} aria-hidden="true" />
                  {t('nav.phoneApp')}
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
        <div className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen((value) => !value)}
            className="liquid-glass flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-[10px] uppercase tracking-[0.08em] text-white/80 transition-colors duration-300 hover:text-white"
            aria-expanded={downloadOpen}
            aria-haspopup="true"
          >
            <Download size={14} aria-hidden="true" />
            {t('nav.downloads')}
            <ChevronDown size={13} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {downloadOpen && (
              <motion.div
                className="liquid-glass absolute right-0 top-full z-50 flex min-w-52 flex-col gap-1 rounded-xl p-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
              >
                <a
                  href={WINDOWS_DOWNLOAD_URL}
                  onClick={() => setDownloadOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download size={15} aria-hidden="true" />
                  {t('nav.downloadPc')}
                </a>
                <a
                  href={MOBILE_APP_URL}
                  onClick={() => setDownloadOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Smartphone size={15} aria-hidden="true" />
                  {t('nav.phoneApp')}
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
