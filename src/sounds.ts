import {
  CloudRain,
  Flame,
  Waves,
  Trees,
  TrainFront,
  Coffee,
  Volume2,
  type LucideIcon,
} from 'lucide-react'

export type SoundId =
  | 'rain'
  | 'fireplace'
  | 'ocean'
  | 'forest'
  | 'train'
  | 'cafe'
  | 'white-noise'
  | 'brown-noise'

export interface AmbientSound {
  id: SoundId
  /** i18n key for the sound name, e.g. 'sound.rain' */
  nameKey: string
  icon: LucideIcon
  /** Audio source. Real URLs can be dropped in here later. */
  src: string
}

/**
 * Built-in ambient sound catalogue.
 *
 * `src` values are intentionally left as empty strings — the audio
 * architecture is fully wired, so real audio URLs can be inserted later
 * without touching any component code. While a source is missing, the
 * engine falls back to a procedurally generated ambient texture so the
 * interface remains fully functional and demonstrable.
 */
export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', nameKey: 'sound.rain', icon: CloudRain, src: '' },
  { id: 'fireplace', nameKey: 'sound.fireplace', icon: Flame, src: '' },
  { id: 'ocean', nameKey: 'sound.ocean', icon: Waves, src: '' },
  { id: 'forest', nameKey: 'sound.forest', icon: Trees, src: '' },
  { id: 'train', nameKey: 'sound.train', icon: TrainFront, src: '' },
  { id: 'cafe', nameKey: 'sound.cafe', icon: Coffee, src: '' },
  { id: 'white-noise', nameKey: 'sound.white-noise', icon: Volume2, src: '' },
  { id: 'brown-noise', nameKey: 'sound.brown-noise', icon: Volume2, src: '' },
]

/** Quick focus durations, in minutes. */
export const QUICK_DURATIONS = [15, 25, 45, 60, 90] as const

/** Upper bound for a custom session, in minutes (4 hours). */
export const MAX_CUSTOM_MINUTES = 240

export const DEFAULT_DURATION_MINUTES = 25

/** Compact label for a duration button: "25", "1h", "1h 30". */
export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return String(minutes)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}`
}

export interface CompletionMessage {
  titleKey: string
  subtitleKey: string
}

/**
 * Completion copy scales with session length. Long sessions earn a fuller
 * acknowledgement; short ones stay gentle but never dismissive.
 */
const COMPLETION_BANDS: { minMinutes: number; message: CompletionMessage }[] = [
  { minMinutes: 60, message: { titleKey: 'complete.60.title', subtitleKey: 'complete.60.subtitle' } },
  { minMinutes: 30, message: { titleKey: 'complete.30.title', subtitleKey: 'complete.30.subtitle' } },
  { minMinutes: 15, message: { titleKey: 'complete.15.title', subtitleKey: 'complete.15.subtitle' } },
  { minMinutes: 5, message: { titleKey: 'complete.5.title', subtitleKey: 'complete.5.subtitle' } },
  { minMinutes: 0, message: { titleKey: 'complete.0.title', subtitleKey: 'complete.0.subtitle' } },
]

export function getCompletionMessage(durationSeconds: number): CompletionMessage {
  const minutes = Math.max(0, Math.ceil(durationSeconds / 60))
  const band =
    COMPLETION_BANDS.find((b) => minutes >= b.minMinutes) ??
    COMPLETION_BANDS[COMPLETION_BANDS.length - 1]
  return band.message
}
