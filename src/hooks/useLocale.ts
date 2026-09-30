import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext, type I18nContextValue } from '../i18n/context'
import { LOCALES, translate, type Locale } from '../i18n/messages'

const STORAGE_KEY = 'still-focus-locale'

function getInitialLocale(): Locale {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (stored === 'en' || stored === 'fa') return stored
  // Persian-speaking browser? Start in Persian.
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('fa')) {
    return 'fa'
  }
  return 'en'
}

export interface UseLocaleResult extends I18nContextValue {
  /** Ready-made value for <I18nContext.Provider>. */
  value: I18nContextValue
}

/**
 * Owns the active locale: persists the choice, keeps `<html lang>` and `dir`
 * in sync so the whole page flips to RTL for Persian, and builds the
 * translation function and the context value.
 */
export function useLocale(): UseLocaleResult {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    const meta = LOCALES[locale]
    document.documentElement.lang = locale
    document.documentElement.dir = meta.dir
  }, [locale])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Storage may be unavailable (private mode, blocked cookies).
    }
  }, [locale])

  const toggle = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'fa' : 'en'))
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, toggle, setLocale, t }),
    [locale, toggle, t],
  )

  return { locale, toggle, setLocale, t, value }
}

export { I18nContext }
