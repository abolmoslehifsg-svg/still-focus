import { createContext, useContext } from 'react'
import { type Locale, translate } from './messages'

export interface I18nContextValue {
  locale: Locale
  /** Flip to the other locale. */
  toggle: () => void
  setLocale: (locale: Locale) => void
  /** Translate a key, with optional {placeholder} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * Access the translation function and the current locale.
 * Falls back to a no-op translator outside of a provider, so a component
 * rendered in isolation never crashes.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: 'en',
      toggle: () => {},
      setLocale: () => {},
      t: (key) => key,
    }
  }
  return ctx
}

/** Build the translator for a given locale, outside of React. */
export function makeT(locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars)
}
