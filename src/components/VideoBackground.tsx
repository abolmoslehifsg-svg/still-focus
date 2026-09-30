const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4'

interface VideoBackgroundProps {
  /** True while a session is running — deepens the vignette. */
  active?: boolean
}

export default function VideoBackground({ active = false }: VideoBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#010101]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Base readability overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.25)' }}
        aria-hidden="true"
      />

      {/* Slightly stronger overlay on small screens */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: 'rgba(0, 0, 0, 0.22)' }}
        aria-hidden="true"
      />

      {/* Subtle vignette — deepens while a session is running */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms] ease-out"
        style={{
          opacity: active ? 1 : 0.65,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
