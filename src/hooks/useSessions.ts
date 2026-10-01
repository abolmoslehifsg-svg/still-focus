import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadStorage, saveStorage } from '../lib/storage'

/**
 * A single completed (or abandoned) focus session, persisted locally.
 */
export interface FocusSession {
  id: string
  /** ISO 8601 timestamp of when the session ended. */
  date: string
  /** Planned session length, in seconds. */
  duration: number
  /** Seconds actually focused before the session ended. */
  elapsed: number
  /** The stated intention, if any. */
  goal: string
  /** Whether the timer ran to zero. */
  completed: boolean
  /** Ambient sounds that were active, by id. */
  sounds?: string[]
}

const STORAGE_KEY = 'still-focus-sessions'
const MAX_SESSIONS = 200

/** Shape guard for data read from an untrusted source. */
function isFocusSession(value: unknown): value is FocusSession {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.date === 'string' &&
    typeof s.duration === 'number' &&
    typeof s.elapsed === 'number' &&
    typeof s.goal === 'string' &&
    typeof s.completed === 'boolean'
  )
}

function normalize(raw: unknown): FocusSession[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(isFocusSession).slice(0, MAX_SESSIONS)
}

function makeId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

export interface UseSessionsResult {
  sessions: FocusSession[]
  /** Record a session that just ended. */
  addSession: (session: Omit<FocusSession, 'id' | 'date'>) => FocusSession
  /** Clear all history. */
  clearSessions: () => void
}

/**
 * Persistent focus-session history.
 *
 * Reads defensively: corrupted, partial, or foreign data is filtered out so
 * the app never crashes on someone else's leftover JSON.
 */
export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    normalize(loadStorage<unknown>(STORAGE_KEY, [])),
  )

  useEffect(() => {
    saveStorage(STORAGE_KEY, sessions)
  }, [sessions])

  const addSession = useCallback((session: Omit<FocusSession, 'id' | 'date'>) => {
    const record: FocusSession = {
      id: makeId(),
      date: new Date().toISOString(),
      ...session,
    }
    // Newest first, capped so the store never grows without bound.
    setSessions((prev) => [record, ...prev].slice(0, MAX_SESSIONS))
    return record
  }, [])

  const clearSessions = useCallback(() => setSessions([]), [])

  return { sessions, addSession, clearSessions }
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface Progress {
  /** Actual focused seconds, including sessions ended early. */
  totalSeconds: number
  /** Completed session count. */
  totalSessions: number
  /** Focused seconds since local midnight. */
  todaySeconds: number
  /** Actual focused seconds in the rolling 7-day window. */
  weekSeconds: number
  /** Sessions in the rolling 7-day window. */
  weekSessions: number
  /** Consecutive days (incl. today) with at least one completed session. */
  streak: number
}

const EMPTY_PROGRESS: Progress = {
  totalSeconds: 0,
  totalSessions: 0,
  todaySeconds: 0,
  weekSeconds: 0,
  weekSessions: 0,
  streak: 0,
}

function startOfDay(d: Date): number {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

/**
 * Derive progress from history. Pure function of the session list, so the UI
 * can never drift out of sync with what was actually recorded.
 */
export function computeProgress(sessions: FocusSession[]): Progress {
  const now = Date.now()
  const todayStart = startOfDay(new Date(now))
  const weekStart = now - 7 * 24 * 60 * 60 * 1000

  let totalSeconds = 0
  let totalSessions = 0
  let todaySeconds = 0
  let weekSeconds = 0
  let weekSessions = 0

  // Distinct calendar days with a completed session, oldest → newest.
  const days = new Set<number>()

  for (const s of sessions) {
    const ts = Date.parse(s.date)
    if (Number.isNaN(ts)) continue

    const focused = Math.max(0, Math.min(s.duration, s.elapsed))
    totalSeconds += focused
    if (ts >= todayStart) todaySeconds += focused
    if (ts >= weekStart) {
      weekSeconds += focused
    }

    // Time actually focused always counts. Session counts and streaks still
    // require a completed session.
    if (!s.completed) continue
    totalSessions += 1
    if (ts >= weekStart) weekSessions += 1
    days.add(startOfDay(new Date(ts)))
  }

  return {
    ...EMPTY_PROGRESS,
    totalSeconds,
    totalSessions,
    todaySeconds,
    weekSeconds,
    weekSessions,
    streak: computeStreak(days, todayStart),
  }
}

/**
 * Walk backwards from today collecting consecutive days. A gap ends the
 * streak; today itself counts even though it is still in progress.
 */
function computeStreak(days: Set<number>, todayStart: number): number {
  let streak = 0
  let cursor = todayStart
  // Guard against a pathological (huge or empty) day set.
  for (let i = 0; i < 400; i++) {
    if (days.has(cursor)) {
      streak += 1
      cursor -= 24 * 60 * 60 * 1000
    } else {
      break
    }
  }
  return streak
}

export interface UseProgressResult {
  progress: Progress
}

export function useProgress(sessions: FocusSession[]): UseProgressResult {
  const progress = useMemo(() => computeProgress(sessions), [sessions])
  return { progress }
}

/** Format a duration as a compact, cinematic label: "3h 42m", "25m", "0m". */
export function formatFocusTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds / 60))
  const hours = Math.floor(safe / 60)
  const minutes = safe % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/** Relative day label for the history list: today / yesterday / Mon 14. */
export function formatSessionDay(iso: string): string {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return ''
  const date = new Date(ts)
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

/** Clock time only: "14:05". */
export function formatSessionTime(iso: string): string {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return ''
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}
