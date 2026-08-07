import { CATEGORY_LABEL, DrillCategory, formatClock, relativeDayLabel } from '@/types'

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

function EffortStars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'press' : ''}
          style={{ lineHeight: 1 }}
        >
          <span style={{ fontSize: 26, color: n <= value ? 'var(--amber)' : 'var(--border)' }}>★</span>
        </button>
      ))}
    </div>
  )
}

const EFFORT_LABEL: Record<number, string> = {
  1: 'Very easy', 2: 'Easy', 3: 'Moderate', 4: 'Hard', 5: 'Maximum effort',
}

interface Props {
  focus: string
  date: string
  drills: { drillId: number; name: string; category: DrillCategory; workSeconds: number; restSecondsAfter: number }[]
  totalWorkSeconds: number
  totalRestSeconds: number
  effort: number
  notes: string
  /** When provided, effort + notes become editable and a Save button is shown. Omit for a read-only past-session view. */
  editable?: {
    onEffortChange: (v: number) => void
    onNotesChange: (v: string) => void
    onSave: () => void
  }
}

export function SessionSummaryView({ focus, date, drills, totalWorkSeconds, totalRestSeconds, effort, notes, editable }: Props) {
  const totalSeconds = totalWorkSeconds + totalRestSeconds

  return (
    <div className="px-6 pb-8">
      {/* Headline */}
      <div className="text-center mb-6 anim-scale">
        <div
          className="mx-auto mb-3 flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: 'var(--greenbg)' }}
        >
          <span style={{ fontSize: 26 }}>🎉</span>
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>{focus}</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
          {editable ? "Session complete." : relativeDayLabel(date)}
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-2 mb-6 anim-up d1">
        {[
          ['Net training', totalWorkSeconds],
          ['Rest', totalRestSeconds],
          ['Total time', totalSeconds],
        ].map(([label, val]) => (
          <div key={label as string} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{formatClock(val as number)}</p>
            <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{label as string}</p>
          </div>
        ))}
      </div>

      {/* Per-drill breakdown */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
        Drill breakdown
      </p>
      <div className="mb-6 anim-up d2">
        {drills.map((d, i) => {
          const cat = catColor[d.category]
          return (
            <div
              key={`${d.drillId}-${i}`}
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < drills.length - 1 ? '1px solid var(--bordersoft)' : 'none' }}
            >
              <div className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 24, height: 24, backgroundColor: 'var(--surface)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.bg, color: cat.text, fontSize: 10, fontWeight: 600 }}>
                  {CATEGORY_LABEL[d.category]}
                </span>
              </div>
              <div className="flex-shrink-0 text-right">
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formatClock(d.workSeconds)}</p>
                {d.restSecondsAfter > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>+ {formatClock(d.restSecondsAfter)} rest</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Effort */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
        Perceived effort
      </p>
      <div className="flex items-center justify-between mb-1 anim-up d3">
        <EffortStars value={effort} onChange={editable?.onEffortChange} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{EFFORT_LABEL[effort] ?? ''}</span>
      </div>

      {/* Notes */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 }}>
        Notes
      </p>
      {editable ? (
        <textarea
          value={notes}
          onChange={e => editable.onNotesChange(e.target.value)}
          placeholder="How did it feel? Anything to remember for next time…"
          rows={3}
          className="w-full rounded-xl p-3"
          style={{ backgroundColor: 'var(--surface)', fontSize: 13, color: 'var(--text)', border: '1px solid var(--border)', resize: 'none', fontFamily: 'inherit' }}
        />
      ) : (
        <p style={{ fontSize: 13, color: notes ? 'var(--text2)' : 'var(--muted)', lineHeight: 1.6 }}>
          {notes || 'No notes for this session.'}
        </p>
      )}

      {editable && (
        <button
          onClick={editable.onSave}
          className="press w-full mt-6 py-4 rounded-2xl font-semibold smooth"
          style={{ backgroundColor: 'var(--green)', color: 'white', fontSize: 15 }}
        >
          Save session
        </button>
      )}
    </div>
  )
}
