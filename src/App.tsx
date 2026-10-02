import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Smartphone } from 'lucide-react'
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

const WINDOWS_DOWNLOAD_URL =
  'https://github.com/abolmoslehifsg-svg/still-focus/releases/latest/download/Still-Setup.exe'
const MOBILE_APP_URL = 'https://abolmoslehifsg-svg.github.io/still-focus/'

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
    setShowSounds(false)
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

  const inFocusMode = isRunning || isPaused

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="relative flex min-h-[100vh] min-h-[100dvh] w-full flex-col bg-[#010101]">
        <VideoBackground active={inFocusMode} />

        <div className="relative z-10 flex min-h-[100vh] min-h-[100dvh] w-full flex-col">
          <Navigation dimmed={inFocusMode} />

          <main
            id="focus"
            className={`relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center transition-[padding] duration-1000 ease-in-out sm:px-8 ${inFocusMode ? 'py-6 sm:py-8 md:py-10' : 'pb-12 pt-12 sm:pt-16 md:pt-24'}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              className="overflow-hidden"
              animate={{
                opacity: inFocusMode ? 0 : 1,
                height: inFocusMode ? 0 : 'auto',
                marginBottom: inFocusMode ? 0 : 56,
              }}
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
              className="max-w-xs overflow-hidden font-light leading-relaxed text-white/70 text-sm sm:max-w-md sm:text-base md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: inFocusMode ? 0 : 1,
                y: inFocusMode ? 12 : 0,
                height: inFocusMode ? 0 : 'auto',
                marginBottom: inFocusMode ? 0 : 80,
              }}
              transition={{ duration: 0.8, delay: inFocusMode ? 0 : 0.4 }}
            >
              {t('hero.tagline')}
            </motion.p>

            <motion.div
              className="mb-12 flex flex-wrap items-center justify-center gap-3 sm:mb-16"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: inFocusMode ? 0 : 1, y: inFocusMode ? 8 : 0, height: inFocusMode ? 0 : 'auto' }}
              transition={{ duration: 0.7, delay: inFocusMode ? 0 : 0.55 }}
            >
              <a
                href={WINDOWS_DOWNLOAD_URL}
                className="liquid-glass flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs text-white/90 transition-colors hover:text-white sm:text-sm"
              >
                <Download size={16} aria-hidden="true" />
                {t('nav.downloadPc')}
              </a>
              <a
                href={MOBILE_APP_URL}
                className="liquid-glass flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs text-white/90 transition-colors hover:text-white sm:text-sm"
              >
                <Smartphone size={16} aria-hidden="true" />
                {t('nav.phoneApp')}
              </a>
            </motion.div>

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
            animate={{ opacity: inFocusMode ? 0.12 : 1, y: inFocusMode ? 8 : 0 }}
            transition={{ duration: 0.9, delay: inFocusMode ? 0 : 0.4 }}
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
