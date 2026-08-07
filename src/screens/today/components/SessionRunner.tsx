import { useEffect, useState } from 'react'
import { LibraryDrill, SessionType, WorkoutDrillLog, WorkoutSessionLog, CATEGORY_LABEL, DrillCategory, formatClock } from '@/types'
import { SessionSummaryView } from './SessionSummaryView'

const catColor: Record<DrillCategory, { bg: string; text: string }> = {
  warmup:     { bg: '#FFF4E0', text: '#B8791A' },
  dribbling:  { bg: 'var(--greenbg)', text: 'var(--green)'     },
  passing:    { bg: 'var(--amberbg)', text: 'var(--ambertext)' },
  shooting:   { bg: '#FDEBEB',        text: '#B23A3A'          },
  speed:      { bg: '#EBF0FF',        text: '#3050E0'          },
  stamina:    { bg: 'var(--amberbg)', text: 'var(--ambertext)' },
  resistance: { bg: '#F1EAFB',        text: '#6E3DBA'          },
  match:      { bg: '#EBF0FF',        text: '#3050E0'          },
  cooldown:   { bg: '#E7F6F4',        text: '#1F8073'          },
}

type Phase = 'countdown' | 'work' | 'rest' | 'summary'

interface Props {
  drills: LibraryDrill[]
  focus: string
  sessionType: SessionType
  date: string
  onCancel: () => void
  onFinish: (log: WorkoutSessionLog) => void
}

export function SessionRunner({ drills, focus, sessionType, date, onCancel, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [logs, setLogs] = useState<WorkoutDrillLog[]>([])
  const [effort, setEffort] = useState(3)
  const [notes, setNotes] = useState('')
  const [confirmingExit, setConfirmingExit] = useState(false)

  const drill = drills[index]
  const isLastDrill = index === drills.length - 1

  // 3-2-1 countdown before the first drill.
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('work')
      setElapsed(0)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Stopwatch — ticks up during both the active drill and the rest period.
  useEffect(() => {
    if (phase !== 'work' && phase !== 'rest') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const finishDrill = () => {
    const entry: WorkoutDrillLog = {
      drillId: drill.id, name: drill.name, category: drill.category,
      workSeconds: elapsed, restSecondsAfter: 0,
    }
    setLogs(prev => [...prev, entry])
    if (isLastDrill) {
      setPhase('summary')
    } else {
      setElapsed(0)
      setPhase('rest')
    }
  }

  const startNextDrill = () => {
    setLogs(prev => {
      const copy = [...prev]
      copy[copy.length - 1] = { ...copy[copy.length - 1], restSecondsAfter: elapsed }
      return copy
    })
    setIndex(i => i + 1)
    setElapsed(0)
    setPhase('work')
  }

  const totalWorkSeconds = logs.reduce((a, d) => a + d.workSeconds, 0)
  const totalRestSeconds = logs.reduce((a, d) => a + d.restSecondsAfter, 0)

  const handleSave = () => {
    const log: WorkoutSessionLog = {
      date, focus, sessionType,
      drills: logs,
      totalWorkSeconds, totalRestSeconds,
      totalSeconds: totalWorkSeconds + totalRestSeconds,
      effort, notes: notes.trim(),
      completedAt: new Date().toISOString(),
    }
    onFinish(log)
  }

  const cat = drill ? catColor[drill.category] : catColor.dribbling

  return (
    <div className="fixed inset-0 flex flex-col anim-fade" style={{ backgroundColor: 'var(--bg)', zIndex: 50, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {phase === 'summary' ? 'Session summary' : `Exercise ${Math.min(index + 1, drills.length)} of ${drills.length}`}
        </span>
        {phase !== 'summary' && (
          <button onClick={() => setConfirmingExit(true)} className="press" aria-label="Cancel session">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {phase === 'countdown' && (
          <div className="h-full flex flex-col items-center justify-center px-8">
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>Get ready for</p>
            <h2 className="text-center" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 32 }}>{drill.name}</h2>
            <div key={countdown} className="anim-scale flex items-center justify-center rounded-full" style={{ width: 140, height: 140, backgroundColor: 'var(--green)' }}>
              <span style={{ fontSize: 56, fontWeight: 700, color: 'white' }}>{countdown > 0 ? countdown : 'GO'}</span>
            </div>
          </div>
        )}

        {phase === 'work' && drill && (
          <div className="h-full flex flex-col items-center justify-center px-7">
            <span className="px-2.5 py-1 rounded-full mb-4" style={{ backgroundColor: cat.bg, color: cat.text, fontSize: 11, fontWeight: 700 }}>
              {CATEGORY_LABEL[drill.category]}
            </span>
            <h2 className="text-center" style={{ fontSize: 21, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{drill.name}</h2>
            <p className="text-center mb-8" style={{ fontSize: 13, color: 'var(--muted)' }}>{drill.detail}</p>
            <div className="flex items-center justify-center rounded-full mb-10 anim-scale" style={{ width: 176, height: 176, border: '6px solid var(--greenbg)' }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{formatClock(elapsed)}</span>
            </div>
            <button
              onClick={finishDrill}
              className="press w-full py-4 rounded-2xl font-semibold smooth"
              style={{ backgroundColor: 'var(--green)', color: 'white', fontSize: 15, maxWidth: 320 }}
            >
              ✓ Finish exercise
            </button>
          </div>
        )}

        {phase === 'rest' && (
          <div className="h-full flex flex-col items-center justify-center px-7">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Rest
            </p>
            <div className="flex items-center justify-center rounded-full mb-8" style={{ width: 150, height: 150, backgroundColor: 'var(--amberbg)' }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: 'var(--ambertext)', fontVariantNumeric: 'tabular-nums' }}>{formatClock(elapsed)}</span>
            </div>
            <p className="text-center mb-1" style={{ fontSize: 12, color: 'var(--muted)' }}>Up next</p>
            <h3 className="text-center mb-8" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{drills[index + 1]?.name}</h3>
            <button
              onClick={startNextDrill}
              className="press w-full py-4 rounded-2xl font-semibold smooth"
              style={{ backgroundColor: 'var(--green)', color: 'white', fontSize: 15, maxWidth: 320 }}
            >
              Start next exercise →
            </button>
          </div>
        )}

        {phase === 'summary' && (
          <SessionSummaryView
            focus={focus}
            date={date}
            drills={logs}
            totalWorkSeconds={totalWorkSeconds}
            totalRestSeconds={totalRestSeconds}
            effort={effort}
            notes={notes}
            editable={{ onEffortChange: setEffort, onNotesChange: setNotes, onSave: handleSave }}
          />
        )}
      </div>

      {/* Exit confirmation */}
      {confirmingExit && (
        <>
          <div onClick={() => setConfirmingExit(false)} className="absolute inset-0 anim-fade" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 60 }} />
          <div className="absolute left-5 right-5 rounded-2xl p-5 anim-scale" style={{ top: '40%', backgroundColor: 'var(--bg)', zIndex: 61, boxShadow: '0 12px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>End this session?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
              Your progress on this exercise won't be saved.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmingExit(false)} className="press flex-1 py-3 rounded-xl font-semibold smooth" style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: 14 }}>
                Keep going
              </button>
              <button onClick={onCancel} className="press flex-1 py-3 rounded-xl font-semibold smooth" style={{ backgroundColor: '#FDEBEB', color: '#B23A3A', fontSize: 14 }}>
                End session
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
