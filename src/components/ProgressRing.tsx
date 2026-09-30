interface ProgressRingProps {
  /** 0 → 1, fraction of the session remaining. */
  progress: number
  /** Rendered size of the viewBox. The ring scales down on small screens. */
  size?: number
  strokeWidth?: number
}

/**
 * An extremely subtle circular progress ring rendered as SVG.
 * White at low opacity — never bright, never colourful.
 */
export default function ProgressRing({
  progress,
  size = 420,
  strokeWidth = 1,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circumference * (1 - clamped)

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,86vw)] w-[min(420px,86vw)] -translate-x-1/2 -translate-y-1/2 sm:h-[420px] sm:w-[420px]"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: 'stroke-dashoffset 0.95s linear',
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.22))',
        }}
      />
    </svg>
  )
}
ProgressRing.displayName = 'ProgressRing'
