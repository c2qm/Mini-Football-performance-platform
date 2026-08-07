import { useRef, useState, useEffect } from 'react'
import { PlayerProfile } from '@/types'
import { AVATAR_PRESETS, resolveAvatar } from '@/data/avatars'
import { ScreenContainer } from '@/components/layout/ScreenContainer'

const GOALS_MAP: Record<string, string> = {
  dribbling: 'Improve dribbling & ball control',
  stamina:   'Build stamina & match fitness',
  shooting:  'Sharpen shooting & finishing',
  speed:     'Increase speed & acceleration',
  complete:  'Become a complete player',
}

const EQUIP_MAP: Record<string, string> = {
  ball:  'Ball only',
  cones: 'Ball + cones',
  kit:   'Full training kit',
  gym:   'Kit + gym access',
}

interface Props {
  player: PlayerProfile
  onChangeAvatar: (avatarType: 'preset' | 'photo', avatarValue: string) => void
  onBack?: () => void
}

export function ProfileView({ player, onChangeAvatar, onBack }: Props) {
  const [editingGoals, setEditingGoals] = useState(false)
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // قراءة نتائج اختبارات المهارات المحفوظة من الـ localStorage
  const [skillResults, setSkillResults] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('skill_test_results') || '{}')
    setSkillResults(saved)
  }, [])

  // حساب معدل اختبارات الدقة (Accuracy) لجميع الاختبارات المنجزة
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

  const goals = [
    { text: GOALS_MAP[player.goal] ?? 'Become a better player', done: false },
    { text: 'Improve weak foot consistency', done: false },
    { text: 'Complete first 4-week phase', done: false },
  ]

  const stats = [
    { label: 'Sessions', value: '0'  },
    { label: 'Streak',   value: '0d' },
    { label: 'Drills',   value: '0'  },
  ]

  const expLabel: Record<string, string> = {
    '0-6mo': '< 6 months', '6mo-2yr': '6mo – 2yr', '2-5yr': '2 – 5 years', '5yr+': '5+ years',
  }
  const freqLabel: Record<string, string> = {
    '1-2': '1–2 / week', '3-4': '3–4 / week', '5+': '5–7 / week',
  }

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeAvatar('photo', reader.result)
        setAvatarSheetOpen(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handlePickPreset = (id: string) => {
    onChangeAvatar('preset', id)
    setAvatarSheetOpen(false)
  }

  return (
    <ScreenContainer withBottomNavSpacing className="relative" noPadding>
    <div className="h-full overflow-y-auto scrollbar-hide" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <div className="px-7 pt-5 pb-5 anim-up d0 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="press flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Your profile
          </p>
          <h1 className="font-semibold" style={{ fontSize: 22, color: 'var(--text)' }}>{player.name}</h1>
        </div>
      </div>

      {/* Avatar + stats */}
      <div className="mx-5 mb-5 anim-up d1">
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={() => setAvatarSheetOpen(true)}
              className="press relative flex-shrink-0"
              style={{ width: 56, height: 56 }}
            >
              <AvatarCircle player={player} size={56} />
              <div
                className="flex items-center justify-center"
                style={{
                  position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: 'var(--green)', border: '2px solid var(--surface)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </button>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{player.name}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Age {player.age} · Week 1</p>
            </div>
          </div>
          <div className="grid grid-cols-3">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center py-3" style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skills Breakdown Section (Main & Secondary Bars) ── */}
      <div className="px-5 mb-5 anim-up d1_5">
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }}>
            Skills Performance
          </p>

          {/* Main Skill: Shooting */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              <span>⚽ Shooting</span>
              <span>{shootingScore > 0 ? `${shootingScore}` : 'Unrated'}</span>
            </div>
            {/* Main Bar Progress */}
            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${shootingScore}%`, height: '100%', backgroundColor: 'var(--green)', transition: 'width 0.4s ease' }} />
            </div>

            {/* Secondary Sub-Skills inside Shooting */}
            <div style={{ marginTop: '12px', paddingLeft: '14px', borderLeft: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Secondary Sub-Skill: Accuracy */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: 'var(--muted)' }}>
                  <span>🎯 Accuracy Tests ({completedTestsCount}/6 completed)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{avgAccuracyScore > 0 ? `${avgAccuracyScore} / 100` : 'Not tested'}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${avgAccuracyScore}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.4s ease' }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Player details */}
      <div className="px-5 mb-5 anim-up d2">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
          Player details
        </p>
        {[
          { label: 'Position',    value: player.position },
          { label: 'Experience',  value: expLabel[player.experience] ?? player.experience },
          { label: 'Weak foot',   value: player.weakFoot === 'both' ? 'Both equal' : `${player.weakFoot.charAt(0).toUpperCase() + player.weakFoot.slice(1)} foot` },
          { label: 'Equipment',   value: EQUIP_MAP[player.equipment] ?? player.equipment },
          { label: 'Training',    value: freqLabel[player.frequency] ?? player.frequency },
        ].map((row, i) => (
          <div key={i} className={`flex items-center justify-between py-3.5 anim-up d${i + 2}`} style={{ borderBottom: i < 4 ? '1px solid var(--bordersoft)' : 'none' }}>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>{row.label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div className="px-5 mb-8 anim-up d7">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>Goals</p>
          <button onClick={() => setEditingGoals(!editingGoals)} className="press" style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
            {editingGoals ? 'Done' : 'Edit'}
          </button>
        </div>
        {goals.map((g, i) => (
          <div key={i} className={`flex items-start gap-3 py-3.5 anim-up d${i + 7}`} style={{ borderBottom: i < goals.length - 1 ? '1px solid var(--bordersoft)' : 'none' }}>
            <div className="flex items-center justify-center flex-shrink-0 mt-0.5" style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: g.done ? 'var(--green)' : 'transparent', border: g.done ? 'none' : '1.5px solid var(--border)' }}>
              {g.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <p style={{ fontSize: 13, color: g.done ? 'var(--muted)' : 'var(--text2)', lineHeight: 1.55, textDecorationLine: g.done ? 'line-through' : 'none', textDecorationColor: 'var(--border)' }}>
              {g.text}
            </p>
          </div>
        ))}

        <div className="mt-5 flex items-center gap-2.5 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 28, height: 28, backgroundColor: 'var(--greenbg)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Your plan updates automatically as you complete sessions.
          </p>
        </div>
      </div>
    </div>

    {/* Hidden file input for photo upload (device gallery or camera) */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      capture="user"
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />

    {/* Avatar picker sheet */}
    {avatarSheetOpen && (
      <>
        <div onClick={() => setAvatarSheetOpen(false)} className="absolute inset-0 anim-fade" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl anim-sheet flex flex-col" 
          style={{ backgroundColor: 'var(--bg)', zIndex: 101, boxShadow: '0 -12px 50px rgba(0,0,0,0.25)', maxHeight: '75vh' }}
        >
          <div className="flex justify-center pt-3 pb-3 flex-shrink-0">
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border)' }} />
          </div>
          <div className="px-6 pb-12 overflow-y-auto scrollbar-hide" style={{ flex: 1 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Profile picture</h3>
              <button onClick={() => setAvatarSheetOpen(false)} className="press">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <button
              onClick={handlePickPhoto}
              className="press w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5"
              style={{ backgroundColor: 'var(--greenbg)' }}
            >
              <div className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 32, height: 32, backgroundColor: 'var(--green)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--greentext)' }}>Choose from photos or camera</span>
            </button>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Or pick a default avatar
            </p>
            <div className="grid grid-cols-5 gap-3 pb-12">
              {AVATAR_PRESETS.map(p => {
                const active = player.avatarType === 'preset' && player.avatarValue === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePickPreset(p.id)}
                    className="press flex items-center justify-center smooth"
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: 16, backgroundColor: p.bg,
                      boxShadow: active ? '0 0 0 3px var(--green)' : 'none',
                      fontSize: 32,
                    }}
                  >
                    {p.emoji}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )}
    </ScreenContainer>
  )
}

export function AvatarCircle({ player, size }: { player: PlayerProfile; size: number }) {
  const avatar = resolveAvatar(player)
  const common = { width: size, height: size, borderRadius: size * 0.32 }

  if (avatar.kind === 'photo') {
    return <img src={avatar.url} alt={player.name} style={{ ...common, objectFit: 'cover', display: 'block' }} />
  }
  if (avatar.kind === 'preset') {
    return (
      <div className="flex items-center justify-center" style={{ ...common, backgroundColor: avatar.preset.bg }}>
        <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{avatar.preset.emoji}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center" style={{ ...common, backgroundColor: 'var(--green)' }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
        {player.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}