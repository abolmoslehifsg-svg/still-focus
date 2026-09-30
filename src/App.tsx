import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import About from './components/About'
import FocusTimer from './components/FocusTimer'
import Navigation from './components/Navigation'
import ProgressPanel from './components/ProgressPanel'
import SoundPanel from './components/SoundPanel'
import StaggeredFade from './components/StaggeredFade'
import VideoBackground from './components/VideoBackground'
import { I18nContext } from './i18n/context'
import { useLocale } from './hooks/useLocale'
import { useFocusTimer } from './hooks/useFocusTimer'
import { useAudio } from './hooks/useAudio'
import { useProgress, useSessions } from './hooks/useSessions'
import { playCompletionChime, resumeAudio } from './audio/engine'
import { MAX_CUSTOM_MINUTES } from './sounds'
import { getReward, type Reward } from './rewards'

export default function App() {
  const { value: i18nValue, locale, t } = useLocale()
  const { sessions, addSession, clearSessions } = useSessions()
  const { progress } = useProgress(sessions)
  const audio = useAudio()
  const { mix } = audio

  const [customMinutes, setCustomMinutes] = useState('')
  const [goal, setGoal] = useState('')
  const [reward, setReward] = useState<Reward | null>(null)
  const [showSounds, setShowSounds] = useState(false)

  const streakBeforeRef = useRef(progress.streak)

  const recordSession = useCallback(
    (completed: boolean, planned: number, remaining: number) => {
      addSession({
        duration: planned,
        elapsed: completed ? planned : Math.max(0, planned - remaining),
        goal: goal.trim(),
        completed,
        sounds: mix.map((c) => c.id),
      })
    },
    [addSession, goal, mix],
  )

  const handleComplete = useCallback(
    (planned: number, remaining: number) => {
      streakBeforeRef.current = progress.streak
      recordSession(true, planned, remaining)
      setReward(goal.trim() ? getReward(goal) : null)
      void playCompletionChime(0.6)
    },
    [progress.streak, recordSession, goal],
  )

  // Ending early still records the session — the focused time was real.
  // Passed to `useFocusTimer` as a separate callback so an early finish is
  // never also recorded as a completed one.
  const handleFinishEarly = useCallback(
    (planned: number, remaining: number) => {
      streakBeforeRef.current = progress.streak
      recordSession(false, planned, remaining)
      setReward(goal.trim() ? getReward(goal) : null)
    },
    [progress.streak, recordSession, goal],
  )

  const {
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
  } = useFocusTimer(handleComplete, handleFinishEarly)

  const previousRunning = useRef(false)
  useEffect(() => {
    if (isRunning && !previousRunning.current) void resumeAudio()
    previousRunning.current = isRunning
  }, [isRunning])

  const handleStart = useCallback(async () => {
    await resumeAudio()
    setReward(null)
    await start()
  }, [start])

  const handleResume = useCallback(async () => {
    await resumeAudio()
    await resume()
  }, [resume])

  const handleReset = useCallback(() => {
    reset()
    setReward(null)
  }, [reset])

  const handleDuration = useCallback(
    (minutes: number) => {
      setCustomMinutes('')
      handleReset()
      setDuration(minutes * 60)
    },
    [handleReset, setDuration],
  )

  const handleCustomMinutes = useCallback(
    (value: string) => {
      setCustomMinutes(value)
      const parsed = parseInt(value, 10)
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= MAX_CUSTOM_MINUTES) {
        setDuration(parsed * 60)
      }
    },
    [setDuration],
  )

  const inFocusMode = isRunning

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="relative flex min-h-[100vh] min-h-[100dvh] w-full flex-col bg-[#010101]">
        <VideoBackground active={inFocusMode} />

        <div className="relative z-10 flex min-h-[100vh] min-h-[100dvh] w-full flex-col">
          <Navigation dimmed={inFocusMode} />

          <main
            id="focus"
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-12 text-center sm:px-8 sm:pt-16 md:pt-24"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: inFocusMode ? 0 : 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="mb-10 sm:mb-12 md:mb-14"
            >
              <h1
                className={
                  'font-garamond font-normal leading-[1.15] text-white ' +
                  (locale === 'fa'
                    ? 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl'
                    : 'text-4xl sm:text-6xl md:text-8xl lg:text-9xl')
                }
              >
                <StaggeredFade text={t('hero.line1')} />
                <br />
                <StaggeredFade text={t('hero.line2')} />
              </h1>
            </motion.div>

            <motion.p
              className="mb-12 max-w-xs font-light leading-relaxed text-white/70 text-sm sm:mb-16 sm:max-w-md sm:text-base md:mb-20 md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inFocusMode ? 0 : 1, y: inFocusMode ? 20 : 0 }}
              transition={{ duration: 0.8, delay: inFocusMode ? 0 : 1.6 }}
            >
              {t('hero.tagline')}
            </motion.p>

            <FocusTimer
              timeLeft={timeLeft}
              duration={duration}
              isRunning={isRunning}
              isPaused={isPaused}
              sessionComplete={sessionComplete}
              focused={focused}
              customMinutes={customMinutes}
              goal={goal}
              reward={reward}
              progress={progress}
              previousStreak={streakBeforeRef.current}
              onCustomMinutes={handleCustomMinutes}
              onGoal={setGoal}
              onDuration={handleDuration}
              onStart={handleStart}
              onPause={pause}
              onResume={handleResume}
              onReset={handleReset}
              onFinishEarly={finishEarly}
            />
          </main>

          <motion.div
            className="relative z-30 flex w-full justify-center px-5 pb-6 sm:justify-end sm:px-8 sm:pb-8 md:pb-10"
            id="sounds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.8 }}
          >
            <SoundPanel
              open={showSounds}
              mix={audio.mix}
              masterVolume={audio.masterVolume}
              muted={audio.muted}
              uploadedAudio={audio.uploadedAudio}
              isPlayingUploaded={audio.isPlayingUploaded}
              loopUploaded={audio.loopUploaded}
              onToggle={() => setShowSounds((v) => !v)}
              onToggleSound={audio.toggleSound}
              onSoundVolume={audio.setSoundVolume}
              onToggleSoundMuted={audio.toggleSoundMuted}
              onMasterVolume={audio.setMasterVolume}
              onToggleMute={audio.toggleMute}
              onUpload={audio.upload}
              onClearUploaded={audio.clearUploaded}
              onToggleUploaded={audio.toggleUploaded}
              onToggleLoop={audio.toggleLoop}
            />
          </motion.div>
        </div>

        <ProgressPanel progress={progress} sessions={sessions} onClear={clearSessions} />

        <About />

        <div className="sr-only" aria-live="polite">
          {sessionComplete
            ? t('sr.complete')
            : isRunning
              ? t('sr.running', { minutes: Math.floor(timeLeft / 60) })
              : isPaused
                ? t('sr.paused')
                : ''}
        </div>
      </div>
    </I18nContext.Provider>
  )
}
