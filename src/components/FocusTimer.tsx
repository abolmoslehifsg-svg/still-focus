import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pause, Play, RotateCcw } from 'lucide-react'
import {
  formatDurationLabel,
  getCompletionMessage,
  MAX_CUSTOM_MINUTES,
  QUICK_DURATIONS,
} from '../sounds'
import type { Reward } from '../rewards'
import { useI18n } from '../i18n/context'
import type { Progress } from '../hooks/useSessions'
import ProgressRing from './ProgressRing'

export interface FocusTimerProps {
  timeLeft: number
  duration: number
  isRunning: boolean
  isPaused: boolean
  sessionComplete: boolean
  /** Seconds actually focused in the session that just ended. */
  focused: number
  customMinutes: string
  goal: string
  reward: Reward | null
  /** Live progress, so completion can show what the session just earned. */
  progress: Progress
  /** Streak before this session, to detect a new/extended streak. */
  previousStreak: number
  onCustomMinutes: (value: string) => void
  onGoal: (value: string) => void
  onDuration: (minutes: number) => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onFinishEarly: () => void
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return hours > 0 ? `${hours}:${mmss}` : mmss
}

export default function FocusTimer({
  timeLeft,
  duration,
  isRunning,
  isPaused,
  sessionComplete,
  focused,
  customMinutes,
  goal,
  reward,
  progress,
  previousStreak,
  onCustomMinutes,
  onGoal,
  onDuration,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinishEarly,
}: FocusTimerProps) {
  const progressFraction = duration > 0 ? timeLeft / duration : 0
  const clock = formatClock(timeLeft)
  const completion = getCompletionMessage(duration)
  const busy = isRunning || isPaused
  const { t } = useI18n()
  const hasGoal = Boolean(goal.trim())

  const primaryLabel = sessionComplete
    ? t('timer.startAgain')
    : isRunning
      ? t('timer.pause')
      : isPaused
        ? t('timer.resume')
        : t('timer.start')

  const handlePrimary = () => {
    if (isRunning) onPause()
    else if (isPaused) onResume()
    else onStart()
  }

  const streakDelta = progress.streak - previousStreak

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {sessionComplete ? (
          <motion.section
            key="completion"
            className="mb-6 flex min-h-[300px] w-full max-w-md flex-col items-center justify-center px-4 text-center sm:mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            aria-label={t('timer.complete')}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              {t('timer.complete')}
            </p>
            <h2 className="mt-3 font-garamond text-2xl text-white/90 sm:text-3xl">
              {t(completion.titleKey)}
            </h2>
            <p className="mt-1 text-[11px] text-white/45">{t(completion.subtitleKey)}</p>
            <p className="mt-7 font-garamond text-5xl leading-none text-white tabular-nums sm:text-6xl">
              {formatClock(focused)}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
              {t('timer.focusedTime')}
            </p>
            {hasGoal && (
              <p className="mt-5 max-w-[280px] text-balance text-[13px] leading-relaxed text-white/60">
                {goal.trim()}
              </p>
            )}
            {progress.streak > 0 && (
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
                {t(
                  streakDelta > 0 && previousStreak === 0
                    ? 'progress.streakNew'
                    : 'progress.streakExtended',
                  { count: progress.streak },
                )}
              </p>
            )}
            {hasGoal && reward && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-garamond text-lg text-white/85">{t(reward.titleKey)}</p>
                <p className="mt-1 text-[10px] text-white/40">{t(reward.noteKey)}</p>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            key="timer"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
      <div className="relative flex items-center justify-center">
        {/* Halo — same centre and same box as the progress ring. The source
            video carries a bright "breathing" blob here; this soft spotlight
            binds it to the ring so the two read as one element. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,86vw)] w-[min(420px,86vw)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[1200ms] ease-out sm:h-[420px] sm:w-[420px]"
          style={{
            opacity: isRunning ? 0.22 + 0.28 * progressFraction : 0.12,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0) 74%)',
          }}
          aria-hidden="true"
        />

        <ProgressRing progress={progressFraction} />

        <div className="relative flex flex-col items-center">
          <span className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/35">
            {isRunning
              ? t('timer.inFocus')
              : isPaused
                ? t('timer.paused')
                : sessionComplete
                  ? t('timer.complete')
                  : t('timer.ready')}
          </span>

          <div
            className="font-garamond font-normal leading-none text-white tabular-nums text-6xl sm:text-7xl md:text-8xl"
            role="timer"
            aria-live="polite"
            aria-label={`${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds remaining`}
          >
            {clock}
          </div>

          {/* The goal stays visible during the session — quietly, under the clock. */}
          <AnimatePresence>
            {busy && hasGoal && (
              <motion.p
                className="mt-5 max-w-[240px] text-balance text-center text-[12px] leading-relaxed text-white/45 sm:text-[13px]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
              >
                {goal.trim()}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration options */}
      {!sessionComplete && <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {QUICK_DURATIONS.map((minutes) => {
          const active = duration === minutes * 60 && !sessionComplete
          return (
            <button
              key={minutes}
              type="button"
              disabled={isRunning || isPaused}
              onClick={() => onDuration(minutes)}
              className={[
                'liquid-glass rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 sm:px-5',
                active ? 'text-white' : 'text-white/45 hover:text-white/80',
                isRunning || isPaused ? 'cursor-not-allowed opacity-40' : '',
              ].join(' ')}
              aria-pressed={active}
              aria-label={t('timer.ariaMinutes', { minutes })}
            >
              {formatDurationLabel(minutes)}
            </button>
          )
        })}

        {/* Custom duration */}
        <div className="liquid-glass flex items-center rounded-full px-3 py-2">
          <input
            type="number"
            min={1}
            max={MAX_CUSTOM_MINUTES}
            value={customMinutes}
            disabled={isRunning || isPaused}
            onChange={(e) => onCustomMinutes(e.target.value)}
            className="w-12 bg-transparent text-center text-[11px] uppercase tracking-[0.15em] text-white outline-none [appearance:textfield] disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={t('timer.customAria')}
          />
          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-white/35">{t('timer.min')}</span>
        </div>
      </div>}

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handlePrimary}
          className="liquid-glass flex items-center gap-2.5 rounded-full py-3.5 pl-6 pr-7 text-xs uppercase tracking-[0.2em] text-white/90 transition-colors duration-300 hover:text-white sm:py-4 sm:pl-7 sm:pr-8"
          aria-label={primaryLabel}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
          {primaryLabel}
        </button>

        {/* Finish the session now, keeping whatever time was focused. */}
        <AnimatePresence>
          {busy && (
            <motion.button
              type="button"
              onClick={onFinishEarly}
              className="liquid-glass flex h-12 items-center gap-2 rounded-full px-5 text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:text-white sm:h-[52px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              aria-label={t('timer.finishEarly')}
            >
              <Check size={14} />
              {t('timer.finishEarly')}
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={onReset}
          className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-colors duration-300 hover:text-white sm:h-[52px] sm:w-[52px]"
          aria-label={t('timer.reset')}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Optional intention — shown only when a session is not running. */}
      <AnimatePresence>
        {!busy && !sessionComplete && (
          <motion.div
            className="mt-7 flex w-full max-w-[280px] flex-col items-center sm:max-w-xs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="liquid-glass flex w-full items-center rounded-full px-5 py-2.5">
              <input
                type="text"
                value={goal}
                onChange={(e) => onGoal(e.target.value)}
                maxLength={80}
                placeholder={t('goal.placeholder')}
                className="w-full bg-transparent text-center text-[11px] uppercase tracking-[0.15em] text-white placeholder:text-white/30 outline-none"
                aria-label={t('goal.aria')}
              />
            </div>
            {goal.trim() && (
              <p className="mt-2.5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                {t('goal.hint')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
