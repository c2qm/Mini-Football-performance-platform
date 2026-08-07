import { useState } from 'react'
import { Pencil, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tag } from '@/components/ui/Tag'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FilterChip } from '@/components/ui/FilterChip'
import { Button } from '@/components/ui/Button'
import { useAppData } from '@/context/AppDataContext'
import { DAY_NAMES, planIndexForDate } from '@/types'
import type { SessionType } from '@/types'
import './PlanScreen.css'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const TYPE_META: Record<SessionType, { tag: 'green' | 'yellow' | 'blue' | 'neutral'; label: string }> = {
  technical: { tag: 'green', label: 'Technical' },
  fitness: { tag: 'yellow', label: 'Fitness' },
  game: { tag: 'blue', label: 'Match' },
  rest: { tag: 'neutral', label: 'Rest' },
}

const FOCUS_BY_TYPE: Record<SessionType, string[]> = {
  technical: ['Dribbling & Control', 'Passing & Vision', 'Shooting & Finishing', 'First Touch', 'Crossing', 'Set Pieces'],
  fitness: ['Fitness & Agility', 'Speed & Sprinting', 'Endurance Run', 'Strength & Core'],
  game: ['Small-sided game', 'Full match', 'Rondo drill', 'Position play'],
  rest: ['Rest', 'Active Recovery', 'Stretching only'],
}

const DURATIONS = ['20 min', '30 min', '35 min', '45 min', '60 min', '75 min', '90 min']

const PHASES = [
  { label: 'Foundation', weeks: 'Weeks 1–4', from: 1, to: 4 },
  { label: 'Build-up', weeks: 'Weeks 5–8', from: 5, to: 8 },
  { label: 'Peak & Match', weeks: 'Weeks 9–12', from: 9, to: 12 },
]

const DOT_COLOR: Record<SessionType, string> = {
  technical: 'var(--tag-green-fg)',
  fitness: 'var(--tag-yellow-fg)',
  game: 'var(--tag-blue-fg)',
  rest: 'var(--color-border-strong)',
}

export function PlanScreen() {
  const { data, handlePlanChange } = useAppData()
  const sessions = data!.plan
  const weekStartDate = data!.weekStartDate

  const today = new Date()
  const todayIndex = planIndexForDate(today)

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(todayIndex)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  
  const [draftFocus, setDraftFocus] = useState('')
  const [draftType, setDraftType] = useState<SessionType>('technical')
  const [draftDur, setDraftDur] = useState('45 min')

  const start = new Date(weekStartDate + 'T00:00:00')
  const daysSince = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000))
  const totalDays = 12 * 7
  const weekNum = Math.min(12, Math.floor(daysSince / 7) + 1)
  const overallPct = Math.min(100, Math.round((daysSince / totalDays) * 100))

  const openEditor = (i: number) => {
    const s = sessions[i % sessions.length]
    setDraftFocus(s.focus)
    setDraftType(s.type)
    setDraftDur(s.duration || '45 min')
    setEditingDay(i)
  }

  const save = () => {
    if (editingDay === null) return
    const targetIndex = editingDay % sessions.length
    handlePlanChange(
      sessions.map((s, i) =>
        i === targetIndex
          ? {
              ...s,
              focus: draftFocus || 'Session',
              type: draftType,
              duration: draftType === 'rest' ? '' : draftDur,
              drillIds: draftFocus === s.focus && draftType === s.type ? s.drillIds : undefined,
            }
          : s,
      ),
    )
    setEditingDay(null)
  }

  const session = sessions[selectedDay % sessions.length]
  const meta = TYPE_META[session.type]

  return (
    <ScreenContainer withBottomNavSpacing>
      <div className="plan-screen h-full overflow-y-auto scrollbar-hide pb-12 flex flex-col" style={{ backgroundColor: 'var(--bg)', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
        <div className="anim-up d0">
          <p className="plan-screen__eyebrow">Training plan</p>
          <div className="flex items-center justify-between mb-2">
            <h1 className="plan-screen__title">Week {weekNum} of 12</h1>
            
            <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--surface)' }}>
              {(['weekly', 'monthly', 'yearly'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className="press px-3 py-1.5 rounded-lg font-semibold smooth capitalize"
                  style={{
                    backgroundColor: viewMode === mode ? 'var(--bg)' : 'transparent',
                    color: viewMode === mode ? 'var(--text)' : 'var(--muted)',
                    fontSize: 12,
                    boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="plan-screen__progress">
            <div className="plan-screen__progress-row">
              <span className="plan-screen__progress-label">Overall progress</span>
              <span className="plan-screen__progress-value">{overallPct}%</span>
            </div>
            <ProgressBar value={overallPct} height={3} />
          </div>
        </div>

        {viewMode === 'weekly' && (
          <Card className="anim-up d1">
            <div className="flex items-center justify-between mb-2">
              <p className="plan-screen__hint">Tap a day to edit its plan</p>
              <button 
                onClick={() => setViewMode('monthly')} 
                style={{ fontSize: 12, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Switch to Monthly
              </button>
            </div>
            <div className="plan-screen__week-strip">
              {DAY_LABELS.map((d, i) => {
                const s = sessions[i]
                const active = selectedDay === i
                const isToday = i === todayIndex
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedDay(i)
                      openEditor(i)
                    }}
                    className={`plan-screen__day press ${active ? 'plan-screen__day--active' : ''} ${
                      !active && isToday ? 'plan-screen__day--today' : ''
                    }`}
                  >
                    <span className="plan-screen__day-label">{d}</span>
                    <span
                      className="plan-screen__day-dot"
                      style={{
                        background: active ? '#fff' : DOT_COLOR[s.type],
                        opacity: active ? 1 : s.done ? 0.4 : 1,
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {viewMode === 'monthly' && (
          <Card className="anim-up d1" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setSelectedMonth(prev => (prev === 0 ? 11 : prev - 1))} 
                className="press p-1 rounded-lg" 
                style={{ background: 'var(--surface)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {MONTH_NAMES[selectedMonth]} 2026
              </h3>
              <button 
                onClick={() => setSelectedMonth(prev => (prev === 11 ? 0 : prev + 1))} 
                className="press p-1 rounded-lg" 
                style={{ background: 'var(--surface)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                <span key={idx} style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{d}</span>
              ))}
              {Array.from({ length: 28 }, (_, i) => {
                const dayNum = i + 1
                const sessionIndex = i % sessions.length
                const s = sessions[sessionIndex]
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openEditor(sessionIndex)}
                    className="press flex flex-col items-center justify-center py-2 rounded-xl"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{dayNum}</span>
                    <span 
                      style={{ 
                        width: 6, height: 6, borderRadius: '50%', 
                        backgroundColor: DOT_COLOR[s.type], 
                        marginTop: 4 
                      }} 
                    />
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {viewMode === 'yearly' && (
          <Card className="anim-up d1" padding="lg">
            <p className="plan-screen__hint mb-3">Select a month to view its schedule & manage daily plans</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {MONTH_NAMES.map((m, mIndex) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(mIndex)
                    setViewMode('monthly')
                  }}
                  className="press flex flex-col items-center justify-center p-3 rounded-2xl"
                  style={{
                    backgroundColor: selectedMonth === mIndex ? 'var(--greenbg)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <CalendarIcon size={18} color={selectedMonth === mIndex ? 'var(--green)' : 'var(--muted)'} style={{ marginBottom: 6 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card className="anim-up d2 plan-screen__day-detail" padding="lg">
          <div className="plan-screen__day-detail-head">
            <div>
              <p className="plan-screen__day-detail-eyebrow">
                {DAY_NAMES[selectedDay % DAY_NAMES.length]}
                {selectedDay === todayIndex ? ' · Today' : ''}
              </p>
              <h3 className="plan-screen__day-detail-focus">{session.focus}</h3>
            </div>
            <button type="button" className="plan-screen__edit-btn press" onClick={() => openEditor(selectedDay)}>
              <Pencil size={12} strokeWidth={2.2} />
              <span>Edit</span>
            </button>
          </div>
          {session.type !== 'rest' ? (
            <div className="plan-screen__day-detail-tags">
              <Tag color={meta.tag}>{session.duration}</Tag>
              <Tag color={meta.tag}>{meta.label}</Tag>
            </div>
          ) : (
            <p className="plan-screen__rest-note">Let your body recover. Light stretching recommended.</p>
          )}
        </Card>

        <div className="anim-up d3">
          <p className="plan-screen__section-label">12-week journey</p>
          <Card padding="none">
            {PHASES.map((p, i) => {
              const status = weekNum >= p.from && weekNum <= p.to ? 'active' : weekNum > p.to ? 'done' : 'upcoming'
              return (
                <div key={i} className="plan-screen__phase">
                  <div className={`plan-screen__phase-icon ${status === 'active' ? 'plan-screen__phase-icon--active' : ''}`}>
                    <span className={`plan-screen__phase-dot ${status !== 'upcoming' ? 'plan-screen__phase-dot--filled' : ''}`} />
                  </div>
                  <div className="plan-screen__phase-text">
                    <p className={status === 'upcoming' ? 'plan-screen__phase-label--muted' : 'plan-screen__phase-label'}>{p.label}</p>
                    <p className="plan-screen__phase-weeks">{p.weeks}</p>
                  </div>
                  {status === 'active' && <Tag color="green">Active</Tag>}
                  {status === 'done' && <Tag color="neutral">Done</Tag>}
                </div>
              )
            })}
          </Card>
        </div>

        <BottomSheet
          open={editingDay !== null}
          title={editingDay !== null ? `Edit Plan (Day ${editingDay + 1})` : ''}
          onClose={() => setEditingDay(null)}
        >
          <p className="plan-screen__section-label">Session type</p>
          <div className="plan-screen__type-grid">
            {(Object.keys(TYPE_META) as SessionType[]).map((t) => {
              const on = draftType === t
              return (
                <button
                  key={t}
                  type="button"
                  className={`plan-screen__type-btn press ${on ? 'plan-screen__type-btn--active' : ''}`}
                  onClick={() => {
                    setDraftType(t)
                    setDraftFocus(FOCUS_BY_TYPE[t][0])
                  }}
                >
                  <span className={`plan-screen__type-dot plan-screen__type-dot--${TYPE_META[t].tag}`} />
                  <span>{TYPE_META[t].label}</span>
                </button>
              )
            })}
          </div>

          {draftType !== 'rest' && (
            <>
              <p className="plan-screen__section-label">Focus</p>
              <div className="plan-screen__chip-row">
                {FOCUS_BY_TYPE[draftType].map((f) => (
                  <FilterChip key={f} active={draftFocus === f} onClick={() => setDraftFocus(f)}>
                    {f}
                  </FilterChip>
                ))}
              </div>

              <p className="plan-screen__section-label">Duration</p>
              <div className="plan-screen__chip-row">
                {DURATIONS.map((d) => (
                  <FilterChip key={d} active={draftDur === d} onClick={() => setDraftDur(d)}>
                    {d}
                  </FilterChip>
                ))}
              </div>
            </>
          )}

          <Button fullWidth size="lg" onClick={save}>
            Save session
          </Button>
        </BottomSheet>
      </div>
    </ScreenContainer>
  )
}