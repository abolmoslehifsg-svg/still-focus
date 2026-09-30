import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import About from './components/About'
import FocusTimer from './components/FocusTimer'
import Navigation from './components/Navigation'
import SoundPanel from './components/SoundPanel'
import StaggeredFade from './components/StaggeredFade'
import VideoBackground from './components/VideoBackground'
import {
  playCompletionChime,
  playSound,
  resumeAudio,
  setLoopForUploaded,
  setMasterVolume,
  stopSound,
} from './audio/engine'
import { DEFAULT_DURATION_MINUTES, MAX_CUSTOM_MINUTES, type SoundId } from './sounds'
import { getReward, type Reward } from './rewards'

const TICK_MS = 1000

export default function App() {
  const [duration, setDuration] = useState(DEFAULT_DURATION_MINUTES * 60)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedSound, setSelectedSound] = useState<SoundId | null>(null)
  const [playingSound, setPlayingSound] = useState<SoundId | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [showSounds, setShowSounds] = useState(false)
  const [uploadedAudio, setUploadedAudio] = useState<{ name: string; url: string } | null>(null)
  const [isPlayingUploaded, setIsPlayingUploaded] = useState(false)
  const [loopUploaded, setLoopUploaded] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [goal, setGoal] = useState('')
  const [reward, setReward] = useState<Reward | null>(null)

  const intervalRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // -------------------------------------------------------------------------
  // Countdown
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning) return

    clearTimer()
    intervalRef.current = window.setInterval(() => {
      if (endTimeRef.current === null) return
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearTimer()
        setIsRunning(false)
        setIsPaused(false)
        setSessionComplete(true)
        // Resolve the reward for the stated goal when the session ends.
        setReward(goal.trim() ? getReward(goal) : null)
        endTimeRef.current = null
      }
    }, TICK_MS)

    return clearTimer
  }, [isRunning, clearTimer])

  // -------------------------------------------------------------------------
  // Completion chime — played once, never an alarm.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!sessionComplete) return
    void playCompletionChime(0.6)
  }, [sessionComplete])

  // -------------------------------------------------------------------------
  // Volume
  // -------------------------------------------------------------------------
  useEffect(() => {
    setMasterVolume(muted ? 0 : volume)
  }, [volume, muted])

  // -------------------------------------------------------------------------
  // Cleanup uploaded object URL
  // -------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
    }
  }, [uploadedAudio])

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const handleStart = useCallback(async () => {
    await resumeAudio()
    setSessionComplete(false)
    // After completion the clock reads zero, so restore the full duration.
    const startFrom = timeLeft > 0 ? timeLeft : duration
    setTimeLeft(startFrom)
    endTimeRef.current = Date.now() + startFrom * 1000
    setIsRunning(true)
    setIsPaused(false)
  }, [timeLeft, duration])
  const handlePause = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(true)
    endTimeRef.current = null
  }, [clearTimer])

  const handleResume = useCallback(async () => {
    await resumeAudio()
    endTimeRef.current = Date.now() + timeLeft * 1000
    setIsRunning(true)
    setIsPaused(false)
  }, [timeLeft])

  const handleReset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setIsPaused(false)
    setSessionComplete(false)
    setTimeLeft(duration)
    endTimeRef.current = null
  }, [clearTimer, duration])

  const handleDuration = useCallback(
    (minutes: number) => {
      const seconds = minutes * 60
      setDuration(seconds)
      setTimeLeft(seconds)
      setSessionComplete(false)
      setCustomMinutes('')
    },
    [],
  )

  const handleCustomMinutes = useCallback(
    (value: string) => {
      setCustomMinutes(value)
      const parsed = parseInt(value, 10)
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= MAX_CUSTOM_MINUTES) {
        setDuration(parsed * 60)
        setTimeLeft(parsed * 60)
        setSessionComplete(false)
      }
    },
    [],
  )

  const handleSelectSound = useCallback(
    async (id: SoundId) => {
      if (selectedSound === id) {
        // Same sound selected again → turn it off.
        stopSound()
        setSelectedSound(null)
        setPlayingSound(null)
        setIsPlayingUploaded(false)
        return
      }

      try {
        await playSound(id, { volume: muted ? 0 : volume })
        setSelectedSound(id)
        setPlayingSound(id)
        setIsPlayingUploaded(false)
      } catch {
        // Browser blocked playback (autoplay restrictions). The selection is
        // remembered; starting a session will retry.
        setSelectedSound(id)
        setPlayingSound(null)
      }
    },
    [selectedSound, volume, muted],
  )

  const handleUpload = useCallback(
    (file: File) => {
      // Stop whatever is currently playing before swapping the track,
      // otherwise the previous audio keeps running in the background.
      stopSound()
      if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
      const url = URL.createObjectURL(file)
      setUploadedAudio({ name: file.name, url })
      setIsPlayingUploaded(false)
      setPlayingSound(null)
    },
    [uploadedAudio],
  )

  const handleToggleUploaded = useCallback(async () => {
    if (!uploadedAudio) return
    if (isPlayingUploaded) {
      stopSound()
      setIsPlayingUploaded(false)
      setPlayingSound(null)
      return
    }

    try {
      await playSound('rain', { volume: muted ? 0 : volume, src: uploadedAudio.url, loop: loopUploaded })
      setIsPlayingUploaded(true)
      setPlayingSound(null)
      setSelectedSound(null)
    } catch {
      setIsPlayingUploaded(false)
    }
  }, [uploadedAudio, isPlayingUploaded, volume, muted, loopUploaded])

  const handleClearUploaded = useCallback(() => {
    if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
    if (isPlayingUploaded) stopSound()
    setUploadedAudio(null)
    setIsPlayingUploaded(false)
    setPlayingSound(null)
  }, [uploadedAudio, isPlayingUploaded])

  // Toggling loop while a track is playing must apply to the live element,
  // not just the next playback — otherwise the setting silently does nothing.
  const handleToggleLoop = useCallback(() => {
    setLoopUploaded((v) => {
      const next = !v
      if (uploadedAudio) setLoopForUploaded(uploadedAudio.url, next)
      return next
    })
  }, [uploadedAudio])

  // Ambient sound follows the session lifecycle.
  const previousRunning = useRef(false)
  useEffect(() => {
    if (isRunning && !previousRunning.current && selectedSound && !playingSound) {
      void playSound(selectedSound, { volume: muted ? 0 : volume }).then(() => {
        setPlayingSound(selectedSound)
      })
    }
    previousRunning.current = isRunning
  }, [isRunning, selectedSound, playingSound, volume, muted])

  const inFocusMode = isRunning

  return (
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
            <h1 className="font-garamond font-normal leading-[1.08] tracking-tight text-white text-4xl sm:text-6xl md:text-8xl lg:text-9xl">
              <StaggeredFade text="ENTER YOUR FOCUS" />
              <br />
              <StaggeredFade text="LEAVE THE NOISE" />
            </h1>
          </motion.div>

          <motion.p
            className="mb-12 max-w-xs font-light leading-relaxed text-white/70 text-sm sm:mb-16 sm:max-w-md sm:text-base md:mb-20 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inFocusMode ? 0 : 1, y: inFocusMode ? 20 : 0 }}
            transition={{ duration: 0.8, delay: inFocusMode ? 0 : 1.6 }}
          >
            A quiet space to focus, breathe, and let the world fade away.
          </motion.p>

          <FocusTimer
            timeLeft={timeLeft}
            duration={duration}
            isRunning={isRunning}
            isPaused={isPaused}
            sessionComplete={sessionComplete}
            customMinutes={customMinutes}
            goal={goal}
            reward={reward}
            onCustomMinutes={handleCustomMinutes}
            onGoal={setGoal}
            onDuration={handleDuration}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
          />
        </main>

        {/* Sound panel — bottom centre on mobile, bottom right on desktop.
            The panel floats upward so it never pushes the hero. */}
        <motion.div
          className="relative z-30 flex w-full justify-center px-5 pb-6 sm:justify-end sm:px-8 sm:pb-8 md:pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.8 }}
        >
          <SoundPanel
            open={showSounds}
            selectedSound={selectedSound}
            volume={volume}
            muted={muted}
            uploadedAudio={uploadedAudio}
            isPlayingUploaded={isPlayingUploaded}
            loopUploaded={loopUploaded}
            onToggle={() => setShowSounds((v) => !v)}
            onSelect={handleSelectSound}
            onVolume={(value) => {
              setVolume(value)
              if (value > 0) setMuted(false)
            }}
            onToggleMute={() => setMuted((v) => !v)}
            onUpload={handleUpload}
            onClearUploaded={handleClearUploaded}
            onToggleUploaded={handleToggleUploaded}
            onToggleLoop={handleToggleLoop}
          />
        </motion.div>
      </div>

      <About />

      {/* Screen-reader live region for session state */}
      <div className="sr-only" aria-live="polite">
        {sessionComplete
          ? 'Session complete. Take a breath.'
          : isRunning
            ? `Focus session running. ${Math.floor(timeLeft / 60)} minutes remaining.`
            : isPaused
              ? 'Session paused.'
              : ''}
      </div>
    </div>
  )
}
