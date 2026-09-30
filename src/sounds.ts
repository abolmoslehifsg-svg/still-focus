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
  name: string
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
  { id: 'rain', name: 'Rain', icon: CloudRain, src: '' },
  { id: 'fireplace', name: 'Fireplace', icon: Flame, src: '' },
  { id: 'ocean', name: 'Ocean', icon: Waves, src: '' },
  { id: 'forest', name: 'Forest', icon: Trees, src: '' },
  { id: 'train', name: 'Train', icon: TrainFront, src: '' },
  { id: 'cafe', name: 'Café', icon: Coffee, src: '' },
  { id: 'white-noise', name: 'White Noise', icon: Volume2, src: '' },
  { id: 'brown-noise', name: 'Brown Noise', icon: Volume2, src: '' },
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
  title: string
  subtitle: string
}

/**
 * Completion copy scales with session length. Long sessions earn a fuller
 * acknowledgement; short ones stay gentle but never dismissive.
 */
const COMPLETION_BANDS: { minMinutes: number; message: CompletionMessage }[] = [
  { minMinutes: 60, message: { title: 'Well done.', subtitle: 'Take a breath' } },
  { minMinutes: 30, message: { title: 'That was real focus.', subtitle: 'Take a breath' } },
  { minMinutes: 15, message: { title: 'Good session.', subtitle: 'Take a moment' } },
  { minMinutes: 5, message: { title: 'Nice work.', subtitle: 'Every minute counts' } },
  { minMinutes: 0, message: { title: 'You showed up.', subtitle: "That's where it starts" } },
]

export function getCompletionMessage(durationSeconds: number): CompletionMessage {
  const minutes = Math.max(0, Math.ceil(durationSeconds / 60))
  const band =
    COMPLETION_BANDS.find((b) => minutes >= b.minMinutes) ??
    COMPLETION_BANDS[COMPLETION_BANDS.length - 1]
  return band.message
}
