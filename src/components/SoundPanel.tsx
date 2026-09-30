import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Music, Play, Upload, Volume1, Volume2, VolumeX, X } from 'lucide-react'
import { AMBIENT_SOUNDS, type SoundId } from '../sounds'
import { useI18n } from '../i18n/context'

export interface SoundPanelProps {
  open: boolean
  selectedSound: SoundId | null
  volume: number
  muted: boolean
  uploadedAudio: { name: string; url: string } | null
  isPlayingUploaded: boolean
  loopUploaded: boolean
  onToggle: () => void
  onSelect: (id: SoundId) => void
  onVolume: (value: number) => void
  onToggleMute: () => void
  onUpload: (file: File) => void
  onClearUploaded: () => void
  onToggleUploaded: () => void
  onToggleLoop: () => void
}

export default function SoundPanel({
  open,
  selectedSound,
  volume,
  muted,
  uploadedAudio,
  isPlayingUploaded,
  loopUploaded,
  onToggle,
  onSelect,
  onVolume,
  onToggleMute,
  onUpload,
  onClearUploaded,
  onToggleUploaded,
  onToggleLoop,
}: SoundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const effectiveVolume = muted ? 0 : volume
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
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
        {selectedSound && (
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
            aria-label="Ambient sound controls"
          >
            <div className="overflow-hidden">
              <div className="mb-5 flex items-center justify-between">
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

              {/* Sound grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon
                  const active = selectedSound === sound.id
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => onSelect(sound.id)}
                      className={[
                        'liquid-glass flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 transition-all duration-300',
                        active ? 'text-white' : 'text-white/45 hover:text-white/80',
                      ].join(' ')}
                      aria-pressed={active}
                      aria-label={t(active ? 'sounds.stop' : 'sounds.play') + ' ' + t(sound.nameKey)}
                    >
                      <Icon size={19} strokeWidth={1.4} />
                      <span className="text-[9px] uppercase tracking-[0.12em] leading-tight text-center">
                        {t(sound.nameKey)}
                      </span>
                    </button>
                  )
                })}
              </div>

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

              {/* Volume */}
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
                  value={Math.round(effectiveVolume * 100)}
                  onChange={(e) => onVolume(Number(e.target.value) / 100)}
                  className="minimal-range flex-1"
                  aria-label={t('sounds.volume')}
                />
                <span className="w-9 text-right text-[10px] tabular-nums text-white/40">
                  {Math.round(effectiveVolume * 100)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input — accepts common audio formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
