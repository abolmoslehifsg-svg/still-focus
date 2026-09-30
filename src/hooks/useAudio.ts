import { useCallback, useEffect, useState } from 'react'
import {
  addSoundToMix,
  playSound,
  removeSoundFromMix,
  resumeAudio,
  setLoopForUploaded,
  setMasterVolume,
  setSoundMuted,
  setSoundVolume,
  stopSound,
} from '../audio/engine'
import { AMBIENT_SOUNDS, type SoundId } from '../sounds'

const MASTER_VOLUME_KEY = 'still-focus-master-volume'
const MIX_KEY = 'still-focus-mix'

export interface UploadedAudio {
  name: string
  url: string
}

/** One channel of the mixer. */
export interface MixChannel {
  id: SoundId
  /** 0 → 1, this sound's own fader. */
  volume: number
  muted: boolean
}

export interface UseAudioResult {
  /** Currently layered sounds, with per-sound volume and mute. */
  mix: MixChannel[]
  /** True when at least one sound is layered. */
  hasMix: boolean
  masterVolume: number
  muted: boolean
  uploadedAudio: UploadedAudio | null
  isPlayingUploaded: boolean
  loopUploaded: boolean
  /** Toggle a sound in or out of the mix. */
  toggleSound: (id: SoundId) => void
  /** Set one sound's own volume. */
  setSoundVolume: (id: SoundId, value: number) => void
  /** Mute one sound without losing its fader position. */
  toggleSoundMuted: (id: SoundId) => void
  setMasterVolume: (value: number) => void
  toggleMute: () => void
  upload: (file: File) => void
  clearUploaded: () => void
  toggleUploaded: () => void
  toggleLoop: () => void
  /** Stop everything. Called when a session ends. */
  stopAll: () => void
}

function readInitialMasterVolume(): number {
  try {
    const raw = localStorage.getItem(MASTER_VOLUME_KEY)
    if (raw === null) return 0.5
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed
  } catch {
    /* storage unavailable */
  }
  return 0.5
}

/** Restore the saved mix, ignoring anything that is not a valid channel. */
function readInitialMix(): MixChannel[] {
  try {
    const raw = localStorage.getItem(MIX_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const validIds = new Set(AMBIENT_SOUNDS.map((s) => s.id))
    return parsed
      .filter((entry): entry is MixChannel => {
        if (typeof entry !== 'object' || entry === null) return false
        const e = entry as Record<string, unknown>
        return (
          typeof e.id === 'string' &&
          validIds.has(e.id as SoundId) &&
          typeof e.volume === 'number' &&
          typeof e.muted === 'boolean'
        )
      })
      .map((e) => ({ id: e.id, volume: clampVolume(e.volume), muted: e.muted }))
  } catch {
    /* corrupted — start empty */
  }
  return []
}

function clampVolume(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/**
 * Ambient sound mixer.
 *
 * Several sounds can be layered at once. Each runs through its own gain node
 * into the single master gain, so the existing master-volume architecture is
 * preserved on top of the per-sound faders.
 */
export function useAudio(): UseAudioResult {
  const [mix, setMix] = useState<MixChannel[]>(readInitialMix)
  const [masterVolume, setMasterVolumeState] = useState<number>(readInitialMasterVolume)
  const [muted, setMuted] = useState(false)
  const [uploadedAudio, setUploadedAudio] = useState<UploadedAudio | null>(null)
  const [isPlayingUploaded, setIsPlayingUploaded] = useState(false)
  const [loopUploaded, setLoopUploaded] = useState(true)

  // Master gain follows the master volume (and mute) at all times.
  useEffect(() => {
    setMasterVolume(muted ? 0 : masterVolume)
  }, [masterVolume, muted])

  // Persist the master volume and the mix so a refresh restores the room.
  useEffect(() => {
    try {
      localStorage.setItem(MASTER_VOLUME_KEY, String(masterVolume))
    } catch {
      /* noop */
    }
  }, [masterVolume])

  useEffect(() => {
    try {
      localStorage.setItem(MIX_KEY, JSON.stringify(mix))
    } catch {
      /* noop */
    }
  }, [mix])

  // Revoke object URLs so uploaded tracks never leak memory.
  useEffect(() => {
    return () => {
      if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
    }
  }, [uploadedAudio])

  const toggleSound = useCallback(
    async (id: SoundId) => {
      const existing = mix.find((c) => c.id === id)
      if (existing) {
        removeSoundFromMix(id)
        setMix((prev) => prev.filter((c) => c.id !== id))
        return
      }

      const entry: MixChannel = { id, volume: 0.6, muted: false }
      try {
        await addSoundToMix(id, entry.volume)
        setMix((prev) => [...prev, entry])
      } catch {
        // Autoplay restrictions — the channel is not added.
      }
    },
    [mix],
  )

  const handleSetSoundVolume = useCallback((id: SoundId, value: number) => {
    const clamped = clampVolume(value)
    setSoundVolume(id, clamped)
    setMix((prev) => prev.map((c) => (c.id === id ? { ...c, volume: clamped } : c)))
  }, [])

  const toggleSoundMuted = useCallback((id: SoundId) => {
    setMix((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const nextMuted = !c.muted
        setSoundMuted(id, nextMuted)
        return { ...c, muted: nextMuted }
      }),
    )
  }, [])

  const handleSetMasterVolume = useCallback((value: number) => {
    setMasterVolumeState(clampVolume(value))
    if (value > 0) setMuted(false)
  }, [])

  const toggleMute = useCallback(() => setMuted((v) => !v), [])

  const upload = useCallback(
    (file: File) => {
      // Stop whatever is currently playing before swapping the track,
      // otherwise the previous audio keeps running in the background.
      stopSound()
      if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
      const url = URL.createObjectURL(file)
      setUploadedAudio({ name: file.name, url })
      setIsPlayingUploaded(false)
    },
    [uploadedAudio],
  )

  const toggleUploaded = useCallback(async () => {
    if (!uploadedAudio) return
    if (isPlayingUploaded) {
      stopSound()
      setIsPlayingUploaded(false)
      return
    }

    try {
      await playSound('rain', {
        volume: masterVolume,
        src: uploadedAudio.url,
        loop: loopUploaded,
      })
      setIsPlayingUploaded(true)
    } catch {
      setIsPlayingUploaded(false)
    }
  }, [uploadedAudio, isPlayingUploaded, masterVolume, loopUploaded])

  const clearUploaded = useCallback(() => {
    if (uploadedAudio) URL.revokeObjectURL(uploadedAudio.url)
    if (isPlayingUploaded) stopSound()
    setUploadedAudio(null)
    setIsPlayingUploaded(false)
  }, [uploadedAudio, isPlayingUploaded])

  // Toggling loop while a track is playing must apply to the live element,
  // not just the next playback — otherwise the setting silently does nothing.
  const toggleLoop = useCallback(() => {
    setLoopUploaded((v) => {
      const next = !v
      if (uploadedAudio) setLoopForUploaded(uploadedAudio.url, next)
      return next
    })
  }, [uploadedAudio])

  const stopAll = useCallback(() => {
    stopSound()
    setIsPlayingUploaded(false)
  }, [])

  return {
    mix,
    hasMix: mix.length > 0,
    masterVolume,
    muted,
    uploadedAudio,
    isPlayingUploaded,
    loopUploaded,
    toggleSound,
    setSoundVolume: handleSetSoundVolume,
    toggleSoundMuted,
    setMasterVolume: handleSetMasterVolume,
    toggleMute,
    upload,
    clearUploaded,
    toggleUploaded,
    toggleLoop,
    stopAll,
  }
}

/** The audio context must be resumed from a user gesture; expose that. */
export async function unlockAudio(): Promise<void> {
  await resumeAudio()
}
