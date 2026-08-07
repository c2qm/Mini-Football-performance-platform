import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SkillSet, relativeDayLabel } from '@/types'
import { useAppData } from '@/context/AppDataContext'
import { SessionSummaryView } from '../today/components/SessionSummaryView'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { RotateCcw } from 'lucide-react'

const SKILL_LABELS: (keyof SkillSet)[] = ['dribbling', 'speed', 'stamina', 'passing', 'shooting']
const SKILL_DISPLAY: Record<string, { label: string; emoji: string }> = {
  dribbling: { label: 'Dribbling', emoji: '🎯' },
  passing:   { label: 'Passing',   emoji: '👟' },
  shooting:  { label: 'Shooting',  emoji: '⚽' },
  speed:     { label: 'Speed',     emoji: '⚡' },
  stamina:   { label: 'Stamina',   emoji: '💪' },
}

const getDynamicColor = (val: number) => {
  if (val >= 70) return '#10b981'
  if (val >= 40) return '#eab308'
  if (val > 0) return '#ef4444'
  return 'var(--muted)'
}

function RadarChart({ skills }: { skills: SkillSet }) {
  const cx = 150, cy = 120, R = 75
  const n = SKILL_LABELS.length
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI / n)
  const vertex = (i: number, scale = 1) => ({
    x: cx + R * scale * Math.cos(angle(i)),
    y: cy + R * scale * Math.sin(angle(i)),
  })
  const poly = (pts: {x:number,y:number}[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'

  const vals = SKILL_LABELS.map(k => skills[k])
  const grid = [0.25, 0.5, 0.75, 1.0]

  return (
    <svg width="100%" height={240} viewBox="0 0 300 240" style={{ maxWidth: 340 }}>
      {grid.map(level => (
        <path
          key={level}
          d={poly(Array.from({ length: n }, (_, i) => vertex(i, level)))}
          fill={level === 1 ? 'var(--surface)' : 'none'}
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const v = vertex(i)
        return <line key={i} x1={cx} y1={cy} x2={v.x} y2={v.y} stroke="var(--border)" strokeWidth={1} />
      })}
      <path
        d={poly(vals.map((val, i) => vertex(i, val / 100)))}
        fill="rgba(16,185,129,0.15)"
        stroke="#10b981"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {vals.map((val, i) => {
        const p = vertex(i, val / 100)
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="var(--bg)" stroke="#10b981" strokeWidth={2} />
            <circle cx={p.x} cy={p.y} r={2.5} fill="#10b981" />
          </g>
        )
      })}
      {SKILL_LABELS.map((key, i) => {
        const p = vertex(i, 1.32)
        const disp = SKILL_DISPLAY[key]
        return (
          <text
            key={i}
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            fontSize={11}
            fontFamily="DM Sans, sans-serif"
            fontWeight="600"
            fill="var(--muted)"
          >
            {disp.emoji} {disp.label}
          </text>
        )
      })}
      <circle cx={cx} cy={cy} r={3} fill="var(--border)" />
    </svg>
  )
}

export function ProgressScreen() {
  const navigate = useNavigate()
  const { data } = useAppData()
  
  const [skillResults, setSkillResults] = useState<{ [key: string]: number }>({})
  const [testHistory, setTestHistory] = useState<any[]>([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('skill_test_results') || '{}')
    setSkillResults(saved)

    const historySaved = JSON.parse(localStorage.getItem('skill_test_history') || '[]')
    setTestHistory(historySaved)
  }, [])

  if (!data) return null
  const { profile: player, history, workoutSessions } = data

  const accuracyTestKeys = [
    'Target Precision',
    'Corner Placement',
    'Distance Accuracy',
    'Two Foot Accuracy',
    'Moving Accuracy',
    'Pressure Accuracy'
  ]

  let totalAccuracyScore = 0
  let completedTestsCount = 0

  accuracyTestKeys.forEach(testName => {
    if (skillResults[testName] !== undefined) {
      totalAccuracyScore += skillResults[testName]
      completedTestsCount += 1
    }
  })

  const avgAccuracyScore = completedTestsCount > 0 ? Math.round(totalAccuracyScore / completedTestsCount) : 0
  const shootingScore = Math.round(avgAccuracyScore * 0.3)

  const skills: SkillSet = {
    dribbling: skillResults['Dribbling'] || 0,
    speed: skillResults['Speed'] || 0,
    stamina: skillResults['Stamina'] || 0,
    passing: skillResults['Passing'] || 0,
    shooting: shootingScore,
  }

  const [tab, setTab] = useState<'radar' | 'bars'>('radar')
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const total = Object.values(skills).reduce((a, b) => a + b, 0)
  const avg = Math.round(total / 5)

  const sorted = [...SKILL_LABELS].sort((a, b) => skills[b] - skills[a])
  const strongest = sorted[0]
  const weakest  = sorted[sorted.length - 1]

  const formattedTestHistory = testHistory.map((t, idx) => ({
    date: t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0],
    focus: `Test Result: ${t.testName} (${t.score}/100)`,
    gains: { shooting: Math.round(t.score * 0.3) },
    isTest: true,
    id: idx
  }))

  const combinedHistory = [...formattedTestHistory, ...history]

  return (
    <ScreenContainer withBottomNavSpacing noPadding>
    <div className="h-full overflow-y-auto scrollbar-hide pb-28" style={{ backgroundColor: 'var(--bg)', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>

      <div className="px-7 pt-5 pb-4 anim-up d0 flex items-center justify-between">
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Skill progress
          </p>
          <h1 className="font-semibold" style={{ fontSize: 22, color: 'var(--text)' }}>
            {player.name}'s profile
          </h1>
        </div>
        <button
          onClick={() => navigate('/skill-test')}
          className="press flex items-center gap-1.5 px-3.5 py-2 rounded-xl smooth"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
          title="Retake Assessment"
        >
          <RotateCcw size={14} color="var(--color-accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Retake Test</span>
        </button>
      </div>

      <div className="px-7 pb-2">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'var(--greenbg)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Overall {avg}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{player.position} · {player.experience}</span>
        </div>
      </div>

      <div className="mx-5 my-4 anim-up d1">
        <div className="flex rounded-2xl p-1.5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(['radar', 'bars'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="press flex-1 py-2.5 rounded-xl font-semibold smooth"
              style={{
                backgroundColor: tab === t ? 'var(--bg)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                fontSize: 13,
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {t === 'radar' ? '⬠ Radar' : '▦ Bars'}
            </button>
          ))}
        </div>
      </div>

      <div className="anim-scale d2">
        {tab === 'radar' ? (
          <div className="flex justify-center mb-4 px-4">
            <RadarChart skills={skills} />
          </div>
        ) : (
          <div className="px-5 mb-4">
            {SKILL_LABELS.map((key, i) => {
              const val = skills[key]
              const disp = SKILL_DISPLAY[key]
              const barColor = getDynamicColor(val)

              return (
                <div key={key} className={`mb-5 anim-up d${i}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{disp.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{disp.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{val}</span>
                  </div>
                  
                  <div style={{ height: 8, borderRadius: 6, backgroundColor: 'var(--surface)' }}>
                    <div
                      style={{
                        height: 8, borderRadius: 6,
                        backgroundColor: barColor,
                        width: `${val}%`,
                        transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                        opacity: 0.9,
                      }}
                    />
                  </div>

                  {key === 'shooting' && (
                    <div className="mt-2.5 pt-2" style={{ borderTop: '1px dashed var(--border)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>
                          🎯 Accuracy Tests Average ({completedTestsCount}/6 completed)
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: getDynamicColor(avgAccuracyScore) }}>
                          {avgAccuracyScore} / 100
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 4, backgroundColor: 'var(--surface)' }}>
                        <div
                          style={{
                            height: 5, borderRadius: 4,
                            backgroundColor: getDynamicColor(avgAccuracyScore),
                            width: `${avgAccuracyScore}%`,
                            transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-5 mb-5 anim-up d4">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Highlights
        </p>
        <div className="flex gap-3">
          {[
            { label: 'Strongest', key: strongest, icon: '💪', borderColor: getDynamicColor(skills[strongest]) },
            { label: 'To improve', key: weakest,   icon: '🎯', borderColor: getDynamicColor(skills[weakest]) },
          ].map(({ label, key, icon, borderColor }) => (
            <div
              key={label}
              className="flex-1 p-3.5 rounded-2xl"
              style={{ backgroundColor: 'var(--surface)', borderLeft: `3px solid ${borderColor}` }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{SKILL_DISPLAY[key].label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: borderColor }}>{skills[key]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 anim-up d5">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Recent gains & history
        </p>
        {combinedHistory.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>
            No sessions or tests completed yet — finish today's session or test to start your history.
          </p>
        ) : (
          <div className="space-y-2.5">
            {combinedHistory.slice(0, 10).map((h: any, i: number) => {
              const saved = workoutSessions[h.date]
              const Row = saved && !h.isTest ? 'button' : 'div'
              return (
                <Row
                  key={`${h.date}-${i}`}
                  onClick={saved && !h.isTest ? () => setDetailDate(h.date) : undefined}
                  className={`flex items-center gap-3 w-full text-left anim-up d${i + 5} rounded-2xl smooth${saved && !h.isTest ? ' press' : ''}`}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center justify-center flex-shrink-0 rounded-xl" style={{ width: 36, height: 36, backgroundColor: 'var(--greenbg)' }}>
                    <span style={{ fontSize: 16 }}>{h.isTest ? '🎯' : '⚽'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{h.focus}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {relativeDayLabel(h.date)}{saved && !h.isTest ? ' · Tap for details' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {Object.entries(h.gains || {}).map(([k, v]) => (
                      <span key={k} style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>
                        +{v as number} {SKILL_DISPLAY[k]?.label || k}
                      </span>
                    ))}
                  </div>
                </Row>
              )
            })}
          </div>
        )}
      </div>

      {detailDate && workoutSessions[detailDate] && (
        <>
          <div onClick={() => setDetailDate(null)} className="fixed inset-0 anim-fade" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 30 }} />
          <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl anim-sheet" style={{ backgroundColor: 'var(--bg)', zIndex: 40, boxShadow: '0 -12px 50px rgba(0,0,0,0.15)', maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
            </div>
            <div className="px-4 pb-2 flex justify-end flex-shrink-0">
              <button onClick={() => setDetailDate(null)} className="press">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto scrollbar-hide">
              <SessionSummaryView
                focus={workoutSessions[detailDate].focus}
                date={workoutSessions[detailDate].date}
                drills={workoutSessions[detailDate].drills}
                totalWorkSeconds={workoutSessions[detailDate].totalWorkSeconds}
                totalRestSeconds={workoutSessions[detailDate].totalRestSeconds}
                effort={workoutSessions[detailDate].effort}
                notes={workoutSessions[detailDate].notes}
              />
            </div>
          </div>
        </>
      )}
    </div>
    </ScreenContainer>
  )
}