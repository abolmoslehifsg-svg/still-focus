import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../i18n/context'
import {
  formatFocusTime,
  formatSessionDay,
  formatSessionTime,
  type FocusSession,
  type Progress as ProgressData,
} from '../hooks/useSessions'

interface ProgressPanelProps {
  progress: ProgressData
  sessions: FocusSession[]
  onClear: () => void
}

/**
 * A quiet record of time spent here.
 *
 * Deliberately not a dashboard: one large figure for the week, a row of
 * small supporting stats, and a list of what happened. No charts, no bars
 * to fill, no badges.
 */
export default function ProgressPanel({ progress, sessions, onClear }: ProgressPanelProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  const recent = expanded ? sessions.slice(0, 12) : sessions.slice(0, 3)
  const hasHistory = sessions.length > 0

  return (
    <motion.section
      id="progress"
      className="relative z-10 flex w-full flex-col items-center px-5 pb-20 pt-4 text-center sm:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      aria-label={t('progress.title')}
    >
      <h2 className="mb-10 text-[10px] uppercase tracking-[0.35em] text-white/35 sm:mb-14">
        {t('progress.thisWeek')}
      </h2>

      {/* Headline figure */}
      <p className="font-garamond font-normal leading-none text-white text-6xl sm:text-7xl md:text-8xl">
        <span className="tabular-nums">{formatFocusTime(progress.weekSeconds)}</span>
      </p>

      <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-white/45">
        {progress.weekSessions} {t(progress.weekSessions === 1 ? 'progress.session' : 'progress.sessions')}
        {progress.streak > 0 && (
          <>
            <span className="mx-3 text-white/20" aria-hidden="true">
              ·
            </span>
            {progress.streak} {t('progress.dayStreak')}
          </>
        )}
      </p>

      {/* Supporting stats — three quiet columns, no cards. */}
      <div className="mt-12 flex w-full max-w-md items-start justify-between gap-4 sm:gap-8">
        <Stat label={t('progress.today')} value={formatFocusTime(progress.todaySeconds)} />
        <Divider />
        <Stat
          label={t('progress.allTime')}
          value={formatFocusTime(progress.totalSeconds)}
          sub={`${progress.totalSessions} ${t('progress.sessions')}`}
        />
        <Divider />
        <Stat
          label={t('progress.days')}
          value={String(progress.streak)}
          sub={t('progress.dayStreak')}
        />
      </div>

      {/* Recent sessions */}
      <div className="mt-14 w-full max-w-md">
        <AnimatePresence initial={false} mode="wait">
          {hasHistory ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                  {t('progress.recent')}
                </h3>
                {sessions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="text-[10px] uppercase tracking-[0.2em] text-white/45 transition-colors duration-300 hover:text-white"
                  >
                    {expanded ? t('progress.less') : t('progress.viewAll')}
                  </button>
                )}
              </div>

              <ul className="flex flex-col">
                {recent.map((session, i) => (
                  <SessionRow key={session.id} session={session} index={i} />
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('progress.clearConfirm'))) onClear()
                }}
                className="mt-10 text-[10px] uppercase tracking-[0.25em] text-white/25 transition-colors duration-300 hover:text-white/60"
              >
                {t('progress.clear')}
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              className="text-[12px] leading-relaxed text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('progress.empty')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">{label}</span>
      <span className="mt-2.5 font-garamond text-2xl font-normal text-white/90 tabular-nums sm:text-3xl">
        {value}
      </span>
      {sub && <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/30">{sub}</span>}
    </div>
  )
}

function Divider() {
  return <div className="mt-6 h-12 w-px shrink-0 bg-white/10" aria-hidden="true" />
}

function SessionRow({ session, index }: { session: FocusSession; index: number }) {
  const { t } = useI18n()
  const goal = session.goal.trim() || t('progress.untitled')
  const focused = Math.max(0, Math.min(session.duration, session.elapsed))

  return (
    <motion.li
      className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-4 text-start"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] text-white/75">{goal}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/30">
          {formatSessionDay(session.date)} · {formatSessionTime(session.date)}
          {!session.completed && (
            <span className="ms-2 text-white/25">· {t('progress.incomplete')}</span>
          )}
        </p>
      </div>
      <span className="shrink-0 font-garamond text-base text-white/55 tabular-nums">
        {formatFocusTime(focused)}
      </span>
    </motion.li>
  )
}
