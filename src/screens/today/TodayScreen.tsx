import { useState } from 'react'
import {
  SESSION_GAINS, DAY_NAMES, planIndexForDate, dateKey,
  LibraryDrill, DrillCategory, DRILL_LIBRARY, CATEGORY_LABEL, drillsForSession,
  sessionBlockTemplate, SessionBlockTemplate,
} from '@/types'
import { useAppData } from '@/context/AppDataContext'
import { SessionRunner } from './components/SessionRunner'
import { SessionSummaryView } from './components/SessionSummaryView'
import { ScreenContainer } from '@/components/layout/ScreenContainer'

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

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 10, color: i < rating ? '#D9A441' : 'var(--border)' }}>★</span>
      ))}
    </span>
  )
}

function EffectivenessBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5" style={{ minWidth: 64 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: 'var(--border)' }}>
        <div style={{ width: `${value}%`, height: 4, borderRadius: 4, backgroundColor: 'var(--green)' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{value}%</span>
    </div>
  )
}

export function TodayScreen() {
  const { data, handleToggleDrill, handleSessionComplete, handleChangeDayDrills, handleSaveWorkoutSession } = useAppData()
  if (!data) return null
  const { profile: player, plan, dailyLog, workoutSessions } = data

  const today = new Date()
  const todayKey = dateKey(today)
  const dayIndex = planIndexForDate(today)
  const session = plan[dayIndex]
  const isRestDay = session.type === 'rest'
  const drills = isRestDay ? [] : drillsForSession(session)

  const blocks: SessionBlockTemplate[] = isRestDay ? [] : sessionBlockTemplate(session.focus, session.type)
  const blockPoolIds: Record<string, Set<number>> = {}
  for (const b of blocks) blockPoolIds[b.id] = new Set(b.categories.flatMap(c => DRILL_LIBRARY[c]).map(d => d.id))
  const idsForBlock = (blockId: string) => drills.filter(d => blockPoolIds[blockId]?.has(d.id)).map(d => d.id)
  const structureComplete = blocks.every(b => idsForBlock(b.id).length >= b.min)
  const missingBlocks = blocks.filter(b => idsForBlock(b.id).length < b.min)

  const [picker, setPicker] = useState<{ mode: 'swap' | 'add'; blockId: SessionBlockTemplate['id']; targetId: number | null } | null>(null)
  const [runnerOpen, setRunnerOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const log = dailyLog[todayKey]
  const checked = new Set(log?.checkedDrillIds ?? [])
  const completed = log?.completed ?? false
  const savedSession = workoutSessions[todayKey]

  const progress = drills.length ? checked.size / drills.length : 0

  const handleComplete = () => {
    handleSessionComplete(SESSION_GAINS[session.type] ?? {}, session.focus, session.type)
  }

  const rebuildIds = (blockId: string, newBlockIds: number[]) =>
    blocks.flatMap(b => (b.id === blockId ? newBlockIds : idsForBlock(b.id)))

  const openSwap = (blockId: SessionBlockTemplate['id'], targetId: number) => setPicker({ mode: 'swap', blockId, targetId })
  const openAdd = (blockId: SessionBlockTemplate['id']) => setPicker({ mode: 'add', blockId, targetId: null })

  const choose = (drill: LibraryDrill) => {
    if (!picker) return
    const blockIds = idsForBlock(picker.blockId)
    const nextBlockIds = picker.mode === 'swap' && picker.targetId != null
      ? blockIds.map(id => (id === picker.targetId ? drill.id : id))
      : [...blockIds, drill.id]
    handleChangeDayDrills(dayIndex, rebuildIds(picker.blockId, nextBlockIds))
    setPicker(null)
  }

  const removeDrill = (blockId: SessionBlockTemplate['id'], id: number) => {
    const block = blocks.find(b => b.id === blockId)
    const blockIds = idsForBlock(blockId)
    if (!block || blockIds.length <= block.min) return
    handleChangeDayDrills(dayIndex, rebuildIds(blockId, blockIds.filter(i => i !== id)))
  }

  const activeBlock = picker ? blocks.find(b => b.id === picker.blockId) ?? null : null
  const activeBlockPool: LibraryDrill[] = activeBlock ? activeBlock.categories.flatMap(c => DRILL_LIBRARY[c]) : []
  const activeBlockIds = activeBlock ? idsForBlock(activeBlock.id) : []
  const pickerItems = picker?.mode === 'swap'
    ? activeBlockPool.filter(d => !activeBlockIds.includes(d.id) || d.id === picker.targetId)
    : activeBlockPool.filter(d => !activeBlockIds.includes(d.id))

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <ScreenContainer withBottomNavSpacing noPadding className="relative">
      <div className="h-full overflow-y-auto scrollbar-hide pb-12" style={{ backgroundColor: 'var(--bg)' }}>

        {/* Header */}
        <div className="px-7 pt-5 pb-5 anim-up d0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)', letterSpacing: '0.1em', fontSize: 10 }}>
            {DAY_NAMES[dayIndex]}, {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
          <h1 className="font-semibold leading-tight" style={{ fontSize: 22, color: 'var(--text)' }}>
            {greeting},<br />{player.name}.
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="press smooth text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--greenbg)', color: 'var(--greentext)', fontSize: 11 }}>
              {player.position}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--surface)', color: 'var(--muted)', fontSize: 11 }}>
              Level 2 · Intermediate
            </span>
          </div>
        </div>

        {/* Session card */}
        <div className="mx-5 mb-5 anim-up d1">
          <div className="rounded-2xl p-5" style={{ backgroundColor: isRestDay ? 'var(--surface)' : 'var(--green)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p style={{ color: isRestDay ? 'var(--muted)' : 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Today's session
                </p>
                <h2 className="font-semibold" style={{ fontSize: 18, color: isRestDay ? 'var(--text)' : '#FFFFFF' }}>
                  {session.focus}
                </h2>
              </div>

              {!isRestDay && (
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <circle
                    cx="26" cy="26" r="22" fill="none" stroke="white" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress)}`}
                    transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(.22,1,.36,1)' }}
                  />
                  <text x="26" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600" fontFamily="DM Sans">{checked.size}/{drills.length}</text>
                </svg>
              )}
            </div>

            {!isRestDay && (
              <div className="flex items-center gap-4">
                {[['⏱', session.duration], ['🔥', 'Medium']].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span style={{ fontSize: 12 }}>{icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {isRestDay ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>
                No drills today — let your body recover. Light stretching or a short walk is a great idea.
              </p>
            ) : completed ? (
              <div className="mt-4 flex items-center gap-2 anim-scale">
                <span style={{ fontSize: 16 }}>🎉</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>Session complete. Skills updated!</span>
              </div>
            ) : progress > 0 ? (
              <div className="mt-4" style={{ height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div style={{ height: 4, borderRadius: 4, backgroundColor: 'white', width: `${progress * 100}%`, transition: 'width 0.4s cubic-bezier(.22,1,.36,1)' }} />
              </div>
            ) : null}

            {!isRestDay && !completed && (
              <>
                <button
                  onClick={() => structureComplete && setRunnerOpen(true)}
                  disabled={!structureComplete}
                  className={structureComplete ? 'press w-full mt-4 py-3 rounded-xl font-semibold smooth' : 'w-full mt-4 py-3 rounded-xl font-semibold smooth'}
                  style={{
                    backgroundColor: structureComplete ? 'white' : 'rgba(255,255,255,0.25)',
                    color: structureComplete ? 'var(--green)' : 'rgba(255,255,255,0.75)',
                    fontSize: 14,
                    cursor: structureComplete ? 'pointer' : 'not-allowed',
                  }}
                >
                  ▶ Start session
                </button>
                {!structureComplete && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 1.5 }}>
                    Build your session first — pick at least one exercise for: {missingBlocks.map(b => b.label).join(', ')}.
                  </p>
                )}
              </>
            )}

            {!isRestDay && !completed && progress === 1 && (
              <button
                onClick={handleComplete}
                className="press w-full mt-2 py-3 rounded-xl font-semibold smooth"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)' }}
              >
                ✓ Mark session complete
              </button>
            )}

            {!isRestDay && completed && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setRunnerOpen(true)}
                  className="press flex-1 py-3 rounded-xl font-semibold smooth"
                  style={{ backgroundColor: 'white', color: 'var(--green)', fontSize: 14 }}
                >
                  🔄 Repeat session
                </button>
                {savedSession && (
                  <button
                    onClick={() => setSummaryOpen(true)}
                    className="press flex-1 py-3 rounded-xl font-semibold smooth"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    View summary
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Session structure — build it block by block: Warm-up, Main training, Resistance, Cool-down */}
        {!isRestDay && (
          <div className="px-5 pb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 anim-up d2" style={{ color: 'var(--muted)', letterSpacing: '0.1em', fontSize: 10 }}>
              Your session · {checked.size} of {drills.length} done
            </p>

            {blocks.map((block, bi) => {
              const blockDrills = drills.filter(d => blockPoolIds[block.id]?.has(d.id))
              const canAdd = blockDrills.length < block.max
              const belowMin = blockDrills.length < block.min

              return (
                <div key={block.id} className={`mb-6 anim-up d${Math.min(bi + 1, 8)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{block.label}</p>
                      <span
                        className="px-1.5 py-0.5 rounded-full"
                        style={{
                          fontSize: 10, fontWeight: 700,
                          color: belowMin ? '#B23A3A' : 'var(--muted)',
                          backgroundColor: belowMin ? '#FDEBEB' : 'var(--surface)',
                        }}
                      >
                        {blockDrills.length}/{block.max} · min {block.min}
                      </span>
                    </div>
                    {!completed && canAdd && (
                      <button onClick={() => openAdd(block.id)} className="press" style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>
                        + Add
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{block.hint}</p>

                  {blockDrills.length === 0 && (
                    <button
                      onClick={() => !completed && openAdd(block.id)}
                      className="press w-full text-left rounded-xl smooth"
                      style={{ padding: '14px', backgroundColor: '#FDEBEB', border: '1px dashed #E3A6A6' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#B23A3A' }}>
                        Required — tap to pick {block.label.toLowerCase()} exercises
                      </span>
                    </button>
                  )}

                  <div className="space-y-2.5">
                    {blockDrills.map((drill) => {
                      const done = checked.has(drill.id)
                      const cat = catColor[drill.category]
                      return (
                        <div
                          key={drill.id}
                          className="flex items-center gap-3 w-full smooth rounded-2xl"
                          style={{ 
                            padding: '14px 16px', 
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)' 
                          }}
                        >
                          <button
                            onClick={() => handleToggleDrill(drill.id)}
                            disabled={completed}
                            className="flex-shrink-0 flex items-center justify-center smooth"
                            style={{
                              width: 22, height: 22, borderRadius: 7,
                              border: done ? 'none' : '1.5px solid var(--border)',
                              backgroundColor: done ? 'var(--green)' : 'transparent',
                            }}
                          >
                            {done && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>

                          <button onClick={() => handleToggleDrill(drill.id)} disabled={completed} className="flex-1 min-w-0 text-left">
                            <p className="font-medium smooth" style={{ fontSize: 14, color: done ? 'var(--muted)' : 'var(--text)', textDecorationLine: done ? 'line-through' : 'none', textDecorationColor: 'var(--border)' }}>
                              {drill.name}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{drill.detail}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Stars rating={drill.rating} />
                              <EffectivenessBar value={drill.effectiveness} />
                            </div>
                          </button>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full smooth" style={{ backgroundColor: done ? 'var(--bg)' : cat.bg, color: done ? 'var(--muted)' : cat.text, fontSize: 10 }}>
                              {CATEGORY_LABEL[drill.category]}
                            </span>
                            {!completed && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => openSwap(block.id, drill.id)} className="press" style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>Swap</button>
                                {blockDrills.length > block.min && (
                                  <button onClick={() => removeDrill(block.id, drill.id)} className="press" style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>Remove</button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Coach note */}
            <div className="mt-4 p-4 rounded-xl anim-up d8" style={{ backgroundColor: 'var(--surface)', borderLeft: '3px solid var(--green)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 6 }}>
                Coach's note
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
                Focus on keeping the ball close during today's drills. Your {player.weakFoot} foot is your weaker side — consciously use it today.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Swap / Add exercise sheet */}
      {picker && activeBlock && (
        <>
          <div onClick={() => setPicker(null)} className="absolute inset-0 anim-fade" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 10 }} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl anim-sheet" style={{ backgroundColor: 'var(--bg)', zIndex: 20, boxShadow: '0 -12px 50px rgba(0,0,0,0.15)', maxHeight: '75%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-center pt-3 pb-4 flex-shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
            </div>
            <div className="px-6 pb-3 flex items-center justify-between flex-shrink-0">
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                {picker.mode === 'swap' ? `Swap · ${activeBlock.label}` : `Add · ${activeBlock.label}`}
              </h3>
              <button onClick={() => setPicker(null)} className="press">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-6 pb-6 overflow-y-auto scrollbar-hide">
              {pickerItems.map(d => (
                <button
                  key={d.id}
                  onClick={() => choose(d)}
                  className="press w-full text-left rounded-xl smooth mb-2"
                  style={{ padding: '12px 14px', backgroundColor: 'var(--surface)' }}
                >
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{d.name}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor[d.category].bg, color: catColor[d.category].text, fontSize: 10 }}>
                      {CATEGORY_LABEL[d.category]}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{d.detail}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Stars rating={d.rating} />
                    <EffectivenessBar value={d.effectiveness} />
                  </div>
                </button>
              ))}
              {pickerItems.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>
                  All exercises for this section are already in today's session.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Guided session runner (countdown → per-drill timer → rest → summary) */}
      {runnerOpen && (
        <SessionRunner
          drills={drills}
          focus={session.focus}
          sessionType={session.type}
          date={todayKey}
          onCancel={() => setRunnerOpen(false)}
          onFinish={(log) => {
            handleSaveWorkoutSession(log)
            setRunnerOpen(false)
          }}
        />
      )}

      {/* Read-only view of today's saved session card */}
      {summaryOpen && savedSession && (
        <>
          <div onClick={() => setSummaryOpen(false)} className="absolute inset-0 anim-fade" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 30 }} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl anim-sheet" style={{ backgroundColor: 'var(--bg)', zIndex: 40, boxShadow: '0 -12px 50px rgba(0,0,0,0.15)', maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
            </div>
            <div className="px-4 pb-2 flex justify-end flex-shrink-0">
              <button onClick={() => setSummaryOpen(false)} className="press">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto scrollbar-hide">
              <SessionSummaryView
                focus={savedSession.focus}
                date={savedSession.date}
                drills={savedSession.drills}
                totalWorkSeconds={savedSession.totalWorkSeconds}
                totalRestSeconds={savedSession.totalRestSeconds}
                effort={savedSession.effort}
                notes={savedSession.notes}
              />
            </div>
          </div>
        </>
      )}
    </ScreenContainer>
  )
}