import { AMBIENT_SOUNDS, type SoundId } from '../sounds'

/**
 * Audio engine for Still.
 *
 * Design goals:
 *  - One shared AudioContext (created lazily, after a user gesture, so we
 *    respect browser autoplay restrictions).
 *  - Real audio files (built-in `src` URLs or user uploads) are played
 *    through HTML5 <audio> elements, media-element sourced into the graph
 *    so a single master gain + analyser applies to everything.
 *  - When a built-in sound has no real audio URL yet, we synthesize a
 *    procedural ambient texture with the Web Audio API so the interface
 *    is fully functional and demonstrable. Dropping real URLs into
 *    `sounds.ts` silently switches to file playback — no component changes.
 */

type TextureKind = SoundId

interface Voice {
  stop: () => void
}

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null

const elementSources = new Map<string, MediaElementAudioSourceNode>()
const activeTexture = new Map<SoundId, Voice>()
let activeElement: HTMLAudioElement | null = null
let activeElementKey: string | null = null

/**
 * Per-sound gain nodes for the mixer. Each active sound gets its own gain
 * feeding the master, so sounds can be layered and balanced independently
 * while one master volume still governs everything.
 */
const mixGains = new Map<string, GainNode>()

function ensureContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
    masterGain = ctx.createGain()
    masterGain.gain.value = 1
    masterGain.connect(ctx.destination)
  }
  return ctx
}

/** Browsers suspend the context until a gesture occurs. */
export async function resumeAudio(): Promise<void> {
  try {
    const c = ensureContext()
    if (c.state === 'suspended') {
      await c.resume()
    }
  } catch {
    /* playback may simply be unavailable */
  }
}

export function setMasterVolume(volume: number): void {
  const v = Math.max(0, Math.min(1, volume))
  if (masterGain && ctx) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime)
    masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.08)
  }
}

/**
 * Set the volume of one layered sound. The master gain is unaffected, so the
 * master volume architecture is preserved on top of the per-sound mix.
 */
export function setSoundVolume(id: SoundId, volume: number): void {
  const v = Math.max(0, Math.min(1, volume))
  const gain = mixGains.get(id)
  if (gain && ctx) {
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setTargetAtTime(v, ctx.currentTime, 0.12)
  }
}

/** Mute one layered sound without losing its volume setting. */
export function setSoundMuted(id: SoundId, muted: boolean): void {
  const gain = mixGains.get(id)
  if (gain && ctx) {
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.12)
  }
}

// ---------------------------------------------------------------------------
// Noise buffers
// ---------------------------------------------------------------------------

let whiteBuffer: AudioBuffer | null = null
let brownBuffer: AudioBuffer | null = null

function getWhiteBuffer(c: AudioContext): AudioBuffer {
  if (!whiteBuffer) {
    const length = c.sampleRate * 4
    const buffer = c.createBuffer(1, length, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    whiteBuffer = buffer
  }
  return whiteBuffer
}

function getBrownBuffer(c: AudioContext): AudioBuffer {
  if (!brownBuffer) {
    const length = c.sampleRate * 4
    const buffer = c.createBuffer(1, length, c.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    brownBuffer = buffer
  }
  return brownBuffer
}

function makeNoiseSource(c: AudioContext, kind: 'white' | 'brown'): AudioBufferSourceNode {
  const source = c.createBufferSource()
  source.buffer = kind === 'white' ? getWhiteBuffer(c) : getBrownBuffer(c)
  source.loop = true
  return source
}

// ---------------------------------------------------------------------------
// Procedural ambient textures
// ---------------------------------------------------------------------------

function startTexture(id: TextureKind, volume: number): Voice {
  const c = ensureContext()
  const out = c.createGain()
  out.gain.value = 0
  out.gain.setTargetAtTime(volume, c.currentTime, 0.6)

  // Route through this sound's own mix gain so the mixer can fade it
  // independently of the master volume.
  const mix = getMixGain(id)
  out.connect(mix)

  const nodes: AudioNode[] = [out]
  const sources: AudioBufferSourceNode[] = []
  const oscillators: OscillatorNode[] = []
  let lfos: OscillatorNode[] = []
  const timers: number[] = []
  let stopped = false

  const noise = (kind: 'white' | 'brown', gain: number, filter?: BiquadFilterNode) => {
    const src = makeNoiseSource(c, kind)
    const g = c.createGain()
    g.gain.value = gain
    if (filter) {
      src.connect(filter)
      filter.connect(g)
      nodes.push(filter)
    } else {
      src.connect(g)
    }
    g.connect(out)
    nodes.push(g)
    src.start()
    sources.push(src)
    return g
  }

  const osc = (
    freq: number,
    type: OscillatorType,
    gain: number,
    detune = 0,
  ): { osc: OscillatorNode; gain: GainNode } => {
    const o = c.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.detune.value = detune
    const g = c.createGain()
    g.gain.value = gain
    o.connect(g)
    g.connect(out)
    o.start()
    nodes.push(g)
    oscillators.push(o)
    return { osc: o, gain: g }
  }

  // Slow LFO to keep the texture organic and breathing.
  const lfo = (target: AudioParam, rate: number, depth: number, base: number) => {
    const l = c.createOscillator()
    l.type = 'sine'
    l.frequency.value = rate
    const g = c.createGain()
    g.gain.value = depth
    l.connect(g)
    g.connect(target)
    target.value = base
    l.start()
    lfos.push(l)
    nodes.push(g)
  }

  switch (id) {
    case 'rain': {
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 4200
      noise('white', 0.5, lp)
      const hp = c.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 260
      noise('white', 0.18, hp)
      lfo(lp.frequency, 0.07, 900, 4200)
      break
    }
    case 'fireplace': {
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 900
      noise('brown', 0.6, lp)
      const crackleHp = c.createBiquadFilter()
      crackleHp.type = 'highpass'
      crackleHp.frequency.value = 1500
      noise('white', 0.05, crackleHp)
      lfo(lp.frequency, 0.05, 260, 900)
      break
    }
    case 'ocean': {
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1100
      const swell = c.createGain()
      swell.gain.value = 0.5
      noise('white', 1, lp).connect(swell)
      swell.connect(out)
      nodes.push(swell)
      lfo(swell.gain, 0.09, 0.32, 0.5)
      lfo(lp.frequency, 0.06, 500, 1100)
      break
    }
    case 'forest': {
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 2600
      bp.Q.value = 0.7
      noise('white', 0.22, bp)
      lfo(bp.frequency, 0.05, 700, 2600)
      // distant bird-like chirps
      const chirp = osc(2200, 'sine', 0)
      scheduleChirps(c, chirp.osc, chirp.gain, timers)
      break
    }
    case 'train': {
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 700
      noise('brown', 0.55, lp)
      const rail = c.createGain()
      rail.gain.value = 0.12
      const railOsc = c.createOscillator()
      railOsc.type = 'square'
      railOsc.frequency.value = 2.2
      railOsc.connect(rail)
      rail.connect(out)
      railOsc.start()
      oscillators.push(railOsc)
      nodes.push(rail)
      lfo(lp.frequency, 0.04, 180, 700)
      break
    }
    case 'cafe': {
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2200
      noise('white', 0.2, lp)
      noise('brown', 0.12)
      lfo(lp.frequency, 0.03, 400, 2200)
      break
    }
    case 'white-noise': {
      noise('white', 0.4)
      break
    }
    case 'brown-noise': {
      noise('brown', 0.5)
      break
    }
  }

  return {
    stop: () => {
      if (stopped) return
      stopped = true
      timers.forEach((t) => window.clearTimeout(t))
      const now = c.currentTime
      out.gain.cancelScheduledValues(now)
      out.gain.setTargetAtTime(0, now, 0.25)
      window.setTimeout(
        () => {
          sources.forEach((s) => {
            try {
              s.stop()
            } catch {
              /* already stopped */
            }
          })
          oscillators.forEach((o) => {
            try {
              o.stop()
            } catch {
              /* already stopped */
            }
          })
          lfos.forEach((l) => {
            try {
              l.stop()
            } catch {
              /* already stopped */
            }
          })
          lfos = []
          nodes.forEach((n) => {
            try {
              n.disconnect()
            } catch {
              /* already disconnected */
            }
          })
          try {
            out.disconnect()
          } catch {
            /* already disconnected */
          }
        },
        320,
      )
    },
  }
}

function scheduleChirps(
  c: AudioContext,
  chirp: OscillatorNode,
  gain: GainNode,
  timers: number[],
): void {
  const tick = () => {
    if (!ctx || ctx.state !== 'running') return
    const now = c.currentTime
    const base = 1800 + Math.random() * 1400
    chirp.frequency.cancelScheduledValues(now)
    chirp.frequency.setValueAtTime(base, now)
    chirp.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.09)
    chirp.frequency.exponentialRampToValueAtTime(base * 0.9, now + 0.18)
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.05, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
  }
  const loop = () => {
    tick()
    timers.push(window.setTimeout(loop, 2600 + Math.random() * 4200))
  }
  timers.push(window.setTimeout(loop, 1800 + Math.random() * 2000))
}

// ---------------------------------------------------------------------------
// Public playback API
// ---------------------------------------------------------------------------

export interface PlayOptions {
  volume: number
  /** Object URL or file URL for user-uploaded audio. */
  src?: string
  loop?: boolean
}

function disconnectActiveElement(): void {
  if (activeElement) {
    try {
      activeElement.pause()
    } catch {
      /* noop */
    }
    activeElement = null
  }
  if (activeElementKey) {
    const node = elementSources.get(activeElementKey)
    if (node) {
      try {
        node.disconnect()
      } catch {
        /* noop */
      }
      elementSources.delete(activeElementKey)
    }
    activeElementKey = null
  }
}

function stopAllTextures(): void {
  activeTexture.forEach((voice) => voice.stop())
  activeTexture.clear()
}

/**
 * Lazily create (or reuse) the per-sound gain that feeds the master bus.
 * Created once per sound id and left connected for the session lifetime.
 */
function getMixGain(id: SoundId): GainNode {
  let gain = mixGains.get(id)
  if (!gain) {
    gain = ensureContext().createGain()
    gain.gain.value = 1
    gain.connect(masterGain!)
    mixGains.set(id, gain)
  }
  return gain
}

export async function playSound(id: SoundId, opts: PlayOptions): Promise<void> {
  await resumeAudio()
  const c = ensureContext()

  stopAllTextures()
  disconnectActiveElement()

  const definition = AMBIENT_SOUNDS.find((s) => s.id === id)
  const src = opts.src || definition?.src

  setMasterVolume(opts.volume)

  if (src) {
    const audio = new Audio(src)
    audio.loop = opts.loop !== false
    audio.crossOrigin = 'anonymous'
    audio.preload = 'auto'
    activeElement = audio
    activeElementKey = `el:${src}`
    try {
      const node = c.createMediaElementSource(audio)
      node.connect(getMixGain(id))
      elementSources.set(activeElementKey, node)
    } catch {
      /* CORS-restricted media falls back to element-only playback */
    }
    try {
      await audio.play()
      return
    } catch {
      // Autoplay rejected — surface the failure to the caller.
      activeElement = null
      activeElementKey = null
      throw new Error('playback-rejected')
    }
  }

  // No real audio file available — use the procedural texture.
  activeTexture.set(id, startTexture(id, opts.volume))
}

// ---------------------------------------------------------------------------
// Multi-sound mixing
// ---------------------------------------------------------------------------

export interface MixEntry {
  id: SoundId
  volume: number
}

/**
 * Layer several ambient sounds at once.
 *
 * Each sound runs through its own mix gain, all feeding the single master
 * gain — so the master volume architecture is untouched and per-sound
 * volumes stay independent. Calling this replaces the current mix.
 */
export async function playMix(entries: MixEntry[]): Promise<void> {
  await resumeAudio()
  stopAllTextures()
  disconnectActiveElement()

  for (const { id, volume } of entries) {
    activeTexture.set(id, startTexture(id, volume))
  }
}

/** Add or replace a single layered sound without touching the others. */
export async function addSoundToMix(id: SoundId, volume: number): Promise<void> {
  await resumeAudio()
  // If this sound is already layered, fade it to the new volume instead of
  // restarting it, so toggling is seamless.
  if (activeTexture.has(id)) {
    setSoundVolume(id, volume)
    return
  }
  activeTexture.set(id, startTexture(id, volume))
}

/** Remove one layered sound, leaving the rest of the mix playing. */
export function removeSoundFromMix(id: SoundId): void {
  const texture = activeTexture.get(id)
  if (texture) {
    texture.stop()
    activeTexture.delete(id)
  }
}

export function stopSound(): void {
  stopAllTextures()
  disconnectActiveElement()
}

/**
 * Apply the loop setting to the currently playing uploaded track.
 * No-op when nothing is playing, so it is always safe to call.
 */
export function setLoopForUploaded(src: string, loop: boolean): void {
  if (activeElement && activeElementKey === `el:${src}`) {
    activeElement.loop = loop
  }
}

export function stopSpecificSound(id: SoundId): void {
  removeSoundFromMix(id)
}

/**
 * A soft, glass-like completion chime synthesized on the fly.
 * Plays a gentle bell-like tone with a slow decay — never an alarm.
 */
export async function playCompletionChime(volume = 0.6): Promise<void> {
  await resumeAudio()
  const c = ensureContext()

  const now = c.currentTime
  const out = c.createGain()
  out.gain.setValueAtTime(0, now)
  out.gain.setTargetAtTime(volume, now, 0.12)
  out.connect(masterGain!)

  const partials: Array<[number, number]> = [
    [523.25, 0.5], // C5
    [659.25, 0.28], // E5
    [783.99, 0.18], // G5
    [1046.5, 0.1], // C6
  ]

  partials.forEach(([freq, gain], i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, now)
    const g = c.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.setTargetAtTime(gain, now + i * 0.045, 0.05)
    g.gain.setTargetAtTime(0.0001, now + 0.35 + i * 0.045, 1.6)
    o.connect(g)
    g.connect(out)
    o.start(now)
    o.stop(now + 4.2)
  })

  window.setTimeout(() => {
    try {
      out.disconnect()
    } catch {
      /* noop */
    }
  }, 4600)
}
