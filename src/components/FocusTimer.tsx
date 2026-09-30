import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import {
  formatDurationLabel,
  getCompletionMessage,
  MAX_CUSTOM_MINUTES,
  QUICK_DURATIONS,
} from '../sounds'
import type { Reward } from '../rewards'
import ProgressRing from './ProgressRing'

export interface FocusTimerProps {
  timeLeft: number
  duration: number
  isRunning: boolean
  isPaused: boolean
  sessionComplete: boolean
  customMinutes: string
  goal: string
  reward: Reward | null
  onCustomMinutes: (value: string) => void
  onGoal: (value: string) => void
  onDuration: (minutes: number) => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
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
  customMinutes,
  goal,
  reward,
  onCustomMinutes,
  onGoal,
  onDuration,
  onStart,
  onPause,
  onResume,
  onReset,
}: FocusTimerProps) {
  const progress = duration > 0 ? timeLeft / duration : 0
  const clock = formatClock(timeLeft)
  const completion = getCompletionMessage(duration)
  const busy = isRunning || isPaused

  const primaryLabel = sessionComplete
    ? 'Start again'
    : isRunning
      ? 'Pause'
      : isPaused
        ? 'Resume'
        : 'Start session'

  const handlePrimary = () => {
    if (isRunning) onPause()
    else if (isPaused) onResume()
    else onStart()
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Completion message */}
      <AnimatePresence>
        {sessionComplete && (
          <motion.div
            className="absolute -top-20 flex flex-col items-center sm:-top-24"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          >
            <p className="font-garamond text-xl text-white/90 sm:text-2xl">{completion.title}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/45">
              {completion.subtitle}
            </p>

            {goal.trim() && reward && (
              <motion.div
                className="mt-5 flex max-w-[280px] flex-col items-center sm:max-w-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.9 }}
              >
                <span className="text-[9px] uppercase tracking-[0.35em] text-white/30">
                  Your goal
                </span>
                <span className="mt-1.5 text-[12px] italic text-white/55">&ldquo;{goal.trim()}&rdquo;</span>
                <span className="mt-4 font-garamond text-lg text-white/90 sm:text-xl">
                  {reward.title}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {reward.note}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        {/* Halo — same centre and same box as the progress ring. The source
            video carries a bright "breathing" blob here; this soft spotlight
            binds it to the ring so the two read as one element. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,86vw)] w-[min(420px,86vw)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[1200ms] ease-out sm:h-[420px] sm:w-[420px]"
          style={{
            opacity: isRunning ? 0.22 + 0.28 * progress : 0.12,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0) 74%)',
          }}
          aria-hidden="true"
        />

        <ProgressRing progress={progress} />

        <div className="relative flex flex-col items-center">
          <span className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/35">
            {isRunning ? 'In focus' : isPaused ? 'Paused' : sessionComplete ? 'Complete' : 'Ready'}
          </span>

          <div
            className="font-garamond font-normal leading-none text-white tabular-nums text-6xl sm:text-7xl md:text-8xl"
            role="timer"
            aria-live="polite"
            aria-label={`${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds remaining`}
          >
            {clock}
          </div>
        </div>
      </div>

      {/* Duration options */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
              aria-label={`${minutes} minute focus session`}
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
            aria-label="Custom focus duration in minutes"
          />
          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-white/35">min</span>
        </div>
      </div>

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

        <button
          type="button"
          onClick={onReset}
          className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-colors duration-300 hover:text-white sm:h-[52px] sm:w-[52px]"
          aria-label="Reset timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Optional intention — shown only when a session is not running. */}
      <AnimatePresence>
        {!busy && (
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
                placeholder="a goal, optional"
                className="w-full bg-transparent text-center text-[11px] uppercase tracking-[0.15em] text-white placeholder:text-white/30 outline-none"
                aria-label="Optional focus goal"
              />
            </div>
            {goal.trim() && (
              <p className="mt-2.5 text-[9px] uppercase tracking-[0.25em] text-white/30">
                a reward awaits at the end
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
