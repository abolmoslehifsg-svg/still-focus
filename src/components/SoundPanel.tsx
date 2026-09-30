import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Music, Play, Upload, Volume1, Volume2, VolumeX, X } from 'lucide-react'
import { AMBIENT_SOUNDS } from '../sounds'
import { useI18n } from '../i18n/context'
import type { MixChannel } from '../hooks/useAudio'

export interface SoundPanelProps {
  open: boolean
  mix: MixChannel[]
  masterVolume: number
  muted: boolean
  uploadedAudio: { name: string; url: string } | null
  isPlayingUploaded: boolean
  loopUploaded: boolean
  onToggle: () => void
  onToggleSound: (id: MixChannel['id']) => void
  onSoundVolume: (id: MixChannel['id'], value: number) => void
  onToggleSoundMuted: (id: MixChannel['id']) => void
  onMasterVolume: (value: number) => void
  onToggleMute: () => void
  onUpload: (file: File) => void
  onClearUploaded: () => void
  onToggleUploaded: () => void
  onToggleLoop: () => void
}

export default function SoundPanel({
  open,
  mix,
  masterVolume,
  muted,
  uploadedAudio,
  isPlayingUploaded,
  loopUploaded,
  onToggle,
  onToggleSound,
  onSoundVolume,
  onToggleSoundMuted,
  onMasterVolume,
  onToggleMute,
  onUpload,
  onClearUploaded,
  onToggleUploaded,
  onToggleLoop,
}: SoundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const effectiveMaster = muted ? 0 : masterVolume
  const VolumeIcon = muted || masterVolume === 0 ? VolumeX : masterVolume < 0.5 ? Volume1 : Volume2
  const { t } = useI18n()

  return (
    <div className="relative z-30 flex w-full flex-col items-center sm:items-end">
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="liquid-glass flex items-center gap-2.5 rounded-full px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:text-white"
        aria-expanded={open}
        aria-controls="sound-panel"
      >
        <Music size={14} />
        {t('sounds.title')}
        {mix.length > 0 && (
          <span className="ml-1 h-1 w-1 rounded-full bg-white/70" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="sound-panel"
            className="sound-panel-glass absolute bottom-full mb-4 w-full max-w-md rounded-3xl p-6 sm:p-7"
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 12, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label={t('sounds.ambient')}
          >
            <div className="overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {t('sounds.ambient')}
                </h2>
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors duration-300 hover:text-white"
                  aria-label={t('sounds.close')}
                >
                  <X size={15} />
                </button>
              </div>

              <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-white/25">
                {t('sounds.mixHint')}
              </p>

              {/* Sound grid — tap to layer, tap again to remove */}
              <div className="grid grid-cols-4 gap-2.5">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon
                  const channel = mix.find((c) => c.id === sound.id)
                  const active = Boolean(channel)
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => onToggleSound(sound.id)}
                      className={[
                        'liquid-glass flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 transition-all duration-300',
                        active ? 'text-white' : 'text-white/45 hover:text-white/80',
                      ].join(' ')}
                      aria-pressed={active}
                      aria-label={t(sound.nameKey)}
                    >
                      <Icon size={19} strokeWidth={1.4} />
                      <span className="text-[9px] uppercase tracking-[0.12em] leading-tight text-center">
                        {t(sound.nameKey)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Per-sound faders for everything currently layered */}
              <AnimatePresence initial={false}>
                {mix.length > 0 && (
                  <motion.div
                    className="mt-5 flex flex-col gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {mix.map((channel) => {
                      const sound = AMBIENT_SOUNDS.find((s) => s.id === channel.id)
                      if (!sound) return null
                      const Icon = sound.icon
                      const name = t(sound.nameKey)
                      return (
                        <div key={channel.id} className="flex items-center gap-3">
                          <Icon
                            size={14}
                            strokeWidth={1.4}
                            className="shrink-0 text-white/45"
                            aria-hidden="true"
                          />
                          <span className="w-16 shrink-0 truncate text-[10px] uppercase tracking-[0.12em] text-white/55">
                            {name}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(channel.volume * 100)}
                            onChange={(e) => onSoundVolume(channel.id, Number(e.target.value) / 100)}
                            className="minimal-range flex-1"
                            aria-label={t('sounds.soundVolume', { name })}
                          />
                          <button
                            type="button"
                            onClick={() => onToggleSoundMuted(channel.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors duration-300 hover:text-white"
                            aria-pressed={channel.muted}
                            aria-label={t(channel.muted ? 'sounds.unmuteSound' : 'sounds.muteSound', { name })}
                          >
                            {channel.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploaded track */}
              <div className="mt-5">
                {uploadedAudio ? (
                  <div className="liquid-glass flex items-center gap-3 rounded-2xl p-3">
                    <button
                      type="button"
                      onClick={onToggleUploaded}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors duration-300 hover:text-white"
                      aria-label={isPlayingUploaded ? t('sounds.pauseUploaded') : t('sounds.playUploaded')}
                    >
                      {isPlayingUploaded ? <Volume2 size={15} /> : <Play size={15} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] text-white/80">{uploadedAudio.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                        {t('sounds.yourFile')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleLoop}
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-full text-[9px] uppercase tracking-wider transition-colors duration-300',
                        loopUploaded ? 'text-white' : 'text-white/35 hover:text-white/70',
                      ].join(' ')}
                      aria-pressed={loopUploaded}
                      aria-label={t('sounds.loop')}
                    >
                      {t('sounds.loop')}
                    </button>
                    <button
                      type="button"
                      onClick={onClearUploaded}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 transition-colors duration-300 hover:text-white"
                      aria-label={t('sounds.remove')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="liquid-glass flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[11px] uppercase tracking-[0.2em] text-white/55 transition-colors duration-300 hover:text-white"
                  >
                    <Upload size={14} />
                    {t('sounds.upload')}
                  </button>
                )}
              </div>

              {/* Master volume */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/55 transition-colors duration-300 hover:text-white"
                  aria-label={muted ? t('sounds.unmute') : t('sounds.mute')}
                  aria-pressed={muted}
                >
                  <VolumeIcon size={16} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(effectiveMaster * 100)}
                  onChange={(e) => onMasterVolume(Number(e.target.value) / 100)}
                  className="minimal-range flex-1"
                  aria-label={t('sounds.volume')}
                />
                <span className="w-9 text-right text-[10px] tabular-nums text-white/40">
                  {Math.round(effectiveMaster * 100)}
                </span>
              </div>

              {/* Privacy note — small, elegant, not a warning. */}
              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.2em] text-white/22">
                {t('sounds.privacy')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input — accepts common audio formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          // Reset so selecting the same file again still fires a change.
          e.target.value = ''
        }}
      />
    </div>
  )
}
