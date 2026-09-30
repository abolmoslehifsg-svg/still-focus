import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_DURATION_MINUTES } from '../sounds'

const TICK_MS = 1000

export interface UseFocusTimerResult {
  duration: number
  timeLeft: number
  isRunning: boolean
  isPaused: boolean
  sessionComplete: boolean
  /**
   * Seconds actually focused in the session that just ended.
   * Meaningful only while `sessionComplete` is true.
   */
  focused: number
  setDuration: (seconds: number) => void
  start: () => Promise<void>
  pause: () => void
  resume: () => Promise<void>
  reset: () => void
  /** End the session immediately (used by an early-finish action). */
  finishEarly: () => void
}

/**
 * The countdown itself.
 *
 * Time is tracked against an absolute end timestamp rather than decremented
 * each tick, so a throttled background tab cannot silently stretch a session.
 *
 * `onComplete` fires when the timer runs to zero. `onFinishEarly` fires when
 * the user chooses to stop early. Each receives the planned duration and the
 * seconds still remaining, so the caller can record exactly what was focused
 * without reading state at the moment the interval fires.
 */
export function useFocusTimer(
  onComplete: (planned: number, remaining: number) => void,
  onFinishEarly?: (planned: number, remaining: number) => void,
): UseFocusTimerResult {
  const [duration, setDurationState] = useState(DEFAULT_DURATION_MINUTES * 60)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [focused, setFocused] = useState(0)

  const intervalRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)
  // Latest values read by the completion callback, which fires from the
  // interval and must not close over stale state.
  const durationRef = useRef(duration)
  durationRef.current = duration
  const timeLeftRef = useRef(timeLeft)
  timeLeftRef.current = timeLeft
  const completedRef = useRef(onComplete)
  completedRef.current = onComplete
  const finishEarlyRef = useRef(onFinishEarly)
  finishEarlyRef.current = onFinishEarly

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const complete = useCallback(
    (early: boolean) => {
      clearTimer()
      setIsRunning(false)
      setIsPaused(false)
      setSessionComplete(true)
      endTimeRef.current = null
      const planned = durationRef.current
      // On an early finish the clock stops where it was, so what is shown
      // matches the time that was actually focused.
      const remaining = early ? timeLeftRef.current : 0
      setTimeLeft(remaining)
      setFocused(Math.max(0, planned - remaining))
      if (early) finishEarlyRef.current?.(planned, remaining)
      else completedRef.current(planned, 0)
    },
    [clearTimer],
  )

  useEffect(() => {
    if (!isRunning) return

    clearTimer()
    intervalRef.current = window.setInterval(() => {
      if (endTimeRef.current === null) return
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) complete(false)
    }, TICK_MS)

    return clearTimer
  }, [isRunning, clearTimer, complete])

  const start = useCallback(async () => {
    setSessionComplete(false)
    setFocused(0)
    // After completion the clock reads zero, so restore the full duration.
    const startFrom = timeLeft > 0 ? timeLeft : duration
    setTimeLeft(startFrom)
    endTimeRef.current = Date.now() + startFrom * 1000
    setIsRunning(true)
    setIsPaused(false)
  }, [timeLeft, duration])

  const pause = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(true)
    endTimeRef.current = null
  }, [clearTimer])

  const resume = useCallback(async () => {
    endTimeRef.current = Date.now() + timeLeft * 1000
    setIsRunning(true)
    setIsPaused(false)
  }, [timeLeft])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)
    setSessionComplete(false)
    setTimeLeft(duration)
    endTimeRef.current = null
  }, [clearTimer, duration])

  const finishEarly = useCallback(() => complete(true), [complete])

  const setDuration = useCallback((seconds: number) => {
    setDurationState(seconds)
    setTimeLeft(seconds)
    setSessionComplete(false)
  }, [])

  return {
    duration,
    timeLeft,
    isRunning,
    isPaused,
    sessionComplete,
    focused,
    setDuration,
    start,
    pause,
    resume,
    reset,
    finishEarly,
  }
}
