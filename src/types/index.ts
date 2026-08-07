export interface PlayerProfile {
  name: string
  age: string
  position: string
  experience: string   // '0-6mo' | '6mo-2yr' | '2-5yr' | '5yr+'
  frequency: string    // '1-2' | '3-4' | '5+'
  goal: string         // 'dribbling' | 'stamina' | 'shooting' | 'speed' | 'complete'
  equipment: string    // 'ball' | 'cones' | 'kit' | 'gym'
  weakFoot: string     // 'left' | 'right' | 'both'
  avatarType?: 'initial' | 'preset' | 'photo'
  avatarValue?: string   // preset id (e.g. 'p3') or a data: URL when avatarType === 'photo'
}

export interface SkillSet {
  dribbling: number
  passing: number
  shooting: number
  speed: number
  stamina: number
}

export function computeInitialSkills(player: PlayerProfile): SkillSet {
  const base: Record<string, SkillSet> = {
    Goalkeeper: { dribbling: 30, passing: 50, shooting: 35, speed: 45, stamina: 60 },
    Defender:   { dribbling: 45, passing: 55, shooting: 35, speed: 58, stamina: 62 },
    Midfielder: { dribbling: 55, passing: 72, shooting: 50, speed: 55, stamina: 65 },
    Winger:     { dribbling: 68, passing: 52, shooting: 48, speed: 72, stamina: 58 },
    Striker:    { dribbling: 58, passing: 45, shooting: 75, speed: 65, stamina: 52 },
  }
  const b = base[player.position] ?? { dribbling: 50, passing: 50, shooting: 50, speed: 50, stamina: 50 }

  const mult: Record<string, number> = {
    '0-6mo': 0.52, '6mo-2yr': 0.72, '2-5yr': 1.0, '5yr+': 1.28,
  }
  const m = mult[player.experience] ?? 1.0

  const boost: Partial<Record<keyof SkillSet, number>> = {
    dribbling: player.goal === 'dribbling' ? 6 : 0,
    stamina:   player.goal === 'stamina'   ? 6 : 0,
    shooting:  player.goal === 'shooting'  ? 6 : 0,
    speed:     player.goal === 'speed'     ? 6 : 0,
  }

  return {
    dribbling: Math.min(94, Math.round(b.dribbling * m + (boost.dribbling ?? 0))),
    passing:   Math.min(94, Math.round(b.passing   * m)),
    shooting:  Math.min(94, Math.round(b.shooting  * m + (boost.shooting  ?? 0))),
    speed:     Math.min(94, Math.round(b.speed     * m + (boost.speed     ?? 0))),
    stamina:   Math.min(94, Math.round(b.stamina   * m + (boost.stamina   ?? 0))),
  }
}

export const SESSION_GAINS: Record<string, Partial<SkillSet>> = {
  technical: { dribbling: 3, passing: 2 },
  fitness:   { stamina: 3, speed: 2 },
  game:      { dribbling: 1, passing: 1, shooting: 1, speed: 1, stamina: 1 },
  rest:      {},
  shooting:  { shooting: 3, dribbling: 1 },
}

/* ── Weekly plan / calendar ── */

export type SessionType = 'technical' | 'fitness' | 'game' | 'rest'

export interface DaySession {
  focus: string
  type: SessionType
  duration: string
  done: boolean
  drillIds?: number[]   // chosen exercises for this day; undefined = use the default set for this focus
}

// Index 0 = Monday ... 6 = Sunday, matching DAY_NAMES in Plan.tsx
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const defaultSessions: DaySession[] = [
  { focus: 'Rest',                 type: 'rest',      duration: '',       done: false },
  { focus: 'Dribbling & Control',  type: 'technical', duration: '45 min', done: false },
  { focus: 'Passing & Vision',     type: 'technical', duration: '45 min', done: false },
  { focus: 'Fitness & Agility',    type: 'fitness',   duration: '35 min', done: false },
  { focus: 'Shooting & Finishing', type: 'technical', duration: '45 min', done: false },
  { focus: 'Small-sided game',     type: 'game',      duration: '60 min', done: false },
  { focus: 'Rest & Recovery',      type: 'rest',      duration: '',       done: false },
]

/** Maps a JS Date (Sunday=0) to our Monday-first plan index (Monday=0). */
export function planIndexForDate(d: Date): number {
  return (d.getDay() + 6) % 7
}

/** Local (not UTC) YYYY-MM-DD key for a date, safe to use as an object/storage key. */
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Human label: "Today", "Yesterday", or weekday name for older dates. */
export function relativeDayLabel(key: string): string {
  const today = dateKey(new Date())
  const yesterday = dateKey(new Date(Date.now() - 86400000))
  if (key === today) return 'Today'
  if (key === yesterday) return 'Yesterday'
  const d = new Date(key + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

/* ── Persisted per-day progress + history ── */

export interface DailyLogEntry {
  checkedDrillIds: number[]
  completed: boolean
}

export type DailyLog = Record<string, DailyLogEntry>

export interface HistoryEntry {
  date: string        // YYYY-MM-DD
  focus: string
  sessionType: SessionType
  gains: Partial<SkillSet>
}

/* ── Exercise library: swappable drills per skill, each with a rating + effectiveness ── */

export type DrillCategory = 'warmup' | 'dribbling' | 'passing' | 'shooting' | 'speed' | 'stamina' | 'resistance' | 'match' | 'cooldown'

export interface LibraryDrill {
  id: number
  name: string
  detail: string
  category: DrillCategory
  rating: number          // 1-5 stars, overall drill quality
  effectiveness: number   // 0-100, how effective this drill is for the category's skill
}

export const CATEGORY_LABEL: Record<DrillCategory, string> = {
  warmup: 'Warm-up', dribbling: 'Dribbling', passing: 'Passing', shooting: 'Shooting',
  speed: 'Speed', stamina: 'Stamina', resistance: 'Resistance', match: 'Match', cooldown: 'Cool-down',
}

export const DRILL_LIBRARY: Record<DrillCategory, LibraryDrill[]> = {
  warmup: [
    { id: 701, name: 'Dynamic stretching routine', detail: '5 min · full body',      category: 'warmup', rating: 4, effectiveness: 70 },
    { id: 702, name: 'Light jog + high knees',     detail: '5 min light jog',        category: 'warmup', rating: 3, effectiveness: 60 },
    { id: 703, name: 'Ball touches warm-up',       detail: '5 min · light touches',  category: 'warmup', rating: 4, effectiveness: 65 },
    { id: 704, name: 'Lunges & leg swings',        detail: '3 sets · 10 reps',       category: 'warmup', rating: 3, effectiveness: 62 },
    { id: 705, name: 'Activation circuit (bands)', detail: '5 min · resistance bands', category: 'warmup', rating: 4, effectiveness: 68 },
    { id: 706, name: 'Jumping jacks + skipping',   detail: '3 sets · 40 sec',        category: 'warmup', rating: 3, effectiveness: 58 },
  ],
  dribbling: [
    { id: 101, name: 'Cone slalom dribbling',  detail: '3 sets · 30 sec each', category: 'dribbling', rating: 5, effectiveness: 88 },
    { id: 102, name: 'Ball mastery sequence',  detail: '4 sets · 40 touches',  category: 'dribbling', rating: 4, effectiveness: 80 },
    { id: 103, name: 'Inside-outside touches', detail: '3 sets · 60 sec each', category: 'dribbling', rating: 4, effectiveness: 76 },
    { id: 104, name: '1v1 turning drill',      detail: '4 sets · 5 reps',      category: 'dribbling', rating: 5, effectiveness: 90 },
    { id: 105, name: 'Roulette turns',         detail: '3 sets · 10 reps',     category: 'dribbling', rating: 3, effectiveness: 65 },
    { id: 106, name: 'Close control box drill',detail: '4 sets · 45 sec',      category: 'dribbling', rating: 4, effectiveness: 72 },
  ],
  passing: [
    { id: 201, name: 'Wall pass one-touch',       detail: '4 sets · 40 reps',   category: 'passing', rating: 5, effectiveness: 85 },
    { id: 202, name: 'Long diagonal passing',     detail: '3 sets · 15 reps',   category: 'passing', rating: 4, effectiveness: 78 },
    { id: 203, name: 'Rondo passing (5v2)',       detail: '10 min · 5v2',       category: 'passing', rating: 5, effectiveness: 88 },
    { id: 204, name: 'First-time combination play',detail: '3 sets · 12 reps',  category: 'passing', rating: 4, effectiveness: 74 },
    { id: 205, name: 'Driven pass accuracy',      detail: '3 sets · 10 targets',category: 'passing', rating: 3, effectiveness: 68 },
  ],
  shooting: [
    { id: 301, name: 'Finishing near post',       detail: '4 sets · 8 reps',    category: 'shooting', rating: 5, effectiveness: 90 },
    { id: 302, name: 'Volley technique',          detail: '3 sets · 10 reps',   category: 'shooting', rating: 4, effectiveness: 78 },
    { id: 303, name: 'Power shot practice',       detail: '3 sets · 12 shots',  category: 'shooting', rating: 4, effectiveness: 80 },
    { id: 304, name: '1v1 vs keeper finishing',   detail: '5 reps',             category: 'shooting', rating: 5, effectiveness: 87 },
    { id: 305, name: 'Curled shot accuracy',      detail: '3 sets · 8 reps',    category: 'shooting', rating: 3, effectiveness: 66 },
    { id: 306, name: 'Set-piece / penalty routine', detail: '4 sets · 5 reps',  category: 'shooting', rating: 3, effectiveness: 62 },
  ],
  speed: [
    { id: 401, name: 'Flying sprints',            detail: '6 reps · 30 m',      category: 'speed', rating: 5, effectiveness: 89 },
    { id: 402, name: 'Acceleration starts',       detail: '8 reps · 10 m',      category: 'speed', rating: 5, effectiveness: 85 },
    { id: 403, name: 'Shuttle runs',              detail: '6 sets · 20 m',      category: 'speed', rating: 4, effectiveness: 79 },
    { id: 404, name: 'Agility ladder sprint',     detail: '4 sets · 30 sec',    category: 'speed', rating: 4, effectiveness: 74 },
    { id: 405, name: 'Resisted sprint (band/sled)', detail: '5 reps · 20 m',    category: 'speed', rating: 4, effectiveness: 81 },
    { id: 406, name: 'Interval sprints',          detail: '8 reps · 40 m',      category: 'speed', rating: 3, effectiveness: 70 },
  ],
  stamina: [
    { id: 501, name: 'Interval running',          detail: '6 sets · 3 min on/1 off', category: 'stamina', rating: 5, effectiveness: 86 },
    { id: 502, name: 'Tempo run',                 detail: '20 min steady pace', category: 'stamina', rating: 4, effectiveness: 77 },
    { id: 503, name: 'Hill / stair running',      detail: '8 reps',            category: 'stamina', rating: 4, effectiveness: 80 },
    { id: 504, name: 'Core + conditioning circuit', detail: '3 rounds · 45 sec', category: 'stamina', rating: 3, effectiveness: 68 },
    { id: 505, name: 'Box jumps',                 detail: '3 sets · 12 reps',   category: 'stamina', rating: 3, effectiveness: 64 },
    { id: 506, name: 'Small-sided endurance game', detail: '4 x 8 min',        category: 'stamina', rating: 4, effectiveness: 75 },
  ],
  match: [
    { id: 601, name: 'Rondo warm-up',          detail: '10 min · 5v2', category: 'match', rating: 4, effectiveness: 75 },
    { id: 602, name: 'Small-sided game',       detail: '4 x 8 min',    category: 'match', rating: 5, effectiveness: 88 },
    { id: 603, name: 'Position-specific play', detail: '15 min',      category: 'match', rating: 4, effectiveness: 78 },
    { id: 604, name: 'Full match simulation',  detail: '2 x 30 min',  category: 'match', rating: 4, effectiveness: 80 },
    { id: 605, name: 'Cool-down & stretch',    detail: '10 min',      category: 'match', rating: 3, effectiveness: 55 },
  ],
  resistance: [
    { id: 801, name: 'Bodyweight squats',        detail: '3 sets · 15 reps',  category: 'resistance', rating: 4, effectiveness: 75 },
    { id: 802, name: 'Walking lunges',           detail: '3 sets · 12 reps',  category: 'resistance', rating: 4, effectiveness: 78 },
    { id: 803, name: 'Resistance band work',     detail: '3 sets · 15 reps',  category: 'resistance', rating: 3, effectiveness: 66 },
    { id: 804, name: 'Core strength circuit',    detail: '3 rounds · 45 sec', category: 'resistance', rating: 4, effectiveness: 72 },
    { id: 805, name: 'Plyometric jump training', detail: '4 sets · 10 reps',  category: 'resistance', rating: 5, effectiveness: 85 },
    { id: 806, name: 'Medicine ball throws',     detail: '3 sets · 10 reps',  category: 'resistance', rating: 3, effectiveness: 64 },
    { id: 807, name: 'Push-ups & planks',        detail: '3 sets · to form',  category: 'resistance', rating: 3, effectiveness: 60 },
  ],
  cooldown: [
    { id: 901, name: 'Static stretching',  detail: '8 min · full body', category: 'cooldown', rating: 4, effectiveness: 70 },
    { id: 902, name: 'Light jog + walk',   detail: '5 min',             category: 'cooldown', rating: 3, effectiveness: 55 },
    { id: 903, name: 'Foam rolling',       detail: '5 min',             category: 'cooldown', rating: 3, effectiveness: 60 },
    { id: 904, name: 'Breathing & recovery', detail: '4 min',           category: 'cooldown', rating: 3, effectiveness: 52 },
  ],
}

export function allDrills(): LibraryDrill[] {
  return Object.values(DRILL_LIBRARY).flat()
}

export function findDrill(id: number): LibraryDrill | undefined {
  return allDrills().find(d => d.id === id)
}

/** Which drill categories are relevant for a given day's focus text. Rest days have none. */
export function categoriesForFocus(focus: string, type: SessionType): DrillCategory[] {
  if (type === 'rest') return []
  const f = focus.toLowerCase()
  if (f.includes('dribbl') || f.includes('first touch') || f.includes('control')) return ['dribbling']
  if (f.includes('pass') || f.includes('cross') || f.includes('vision')) return ['passing']
  if (f.includes('shoot') || f.includes('finish') || f.includes('set piece')) return ['shooting']
  if (f.includes('speed') || f.includes('sprint')) return ['speed']
  if (f.includes('endurance') || f.includes('stamina')) return ['stamina']
  if (f.includes('fitness') || f.includes('agility') || f.includes('strength') || f.includes('core')) return ['speed', 'stamina']
  if (type === 'game' || f.includes('game') || f.includes('match') || f.includes('rondo') || f.includes('position')) return ['match']
  return type === 'technical' ? ['dribbling'] : type === 'fitness' ? ['stamina'] : ['match']
}

/** A required slot in a session's structure — e.g. "Warm-up", picked from a fixed pool, within min/max count. */
export interface SessionBlockTemplate {
  id: 'warmup' | 'main' | 'resistance' | 'cooldown'
  label: string
  hint: string
  categories: DrillCategory[]
  min: number
  max: number
}

/**
 * The fixed structure every non-rest session must follow: a warm-up, the focus-specific main
 * block, a resistance/strength block, and a cool-down. The player picks which drills fill each
 * slot (within min/max), but every slot itself is mandatory.
 */
export function sessionBlockTemplate(focus: string, type: SessionType): SessionBlockTemplate[] {
  if (type === 'rest') return []
  return [
    { id: 'warmup',     label: 'Warm-up',               hint: 'Get the body ready before the main work.', categories: ['warmup'],                            min: 1, max: 3 },
    { id: 'main',       label: 'Main training',         hint: `Drills for today's focus: ${focus}.`,       categories: categoriesForFocus(focus, type),       min: 2, max: 5 },
    { id: 'resistance', label: 'Resistance & strength', hint: 'Build the strength that supports the skill.', categories: ['resistance'],                      min: 1, max: 3 },
    { id: 'cooldown',   label: 'Cool-down',             hint: 'Bring the heart rate down and recover.',    categories: ['cooldown'],                          min: 1, max: 2 },
  ]
}

/** Default set of drill ids for a day when the player hasn't customized it yet — one that satisfies every block's minimum. */
export function defaultDrillIdsForSession(focus: string, type: SessionType): number[] {
  const blocks = sessionBlockTemplate(focus, type)
  const ids: number[] = []
  for (const block of blocks) {
    const pool = block.categories.flatMap(c => DRILL_LIBRARY[c])
    const take = Math.min(block.id === 'main' ? Math.max(3, block.min) : block.min, pool.length)
    ids.push(...pool.slice(0, take).map(d => d.id))
  }
  return ids
}

/** Resolves the actual drills to show for a day: its saved drillIds, or sensible defaults. */
export function drillsForSession(session: DaySession): LibraryDrill[] {
  const ids = session.drillIds ?? defaultDrillIdsForSession(session.focus, session.type)
  return ids.map(findDrill).filter((d): d is LibraryDrill => !!d)
}

/* ── Guided workout session run (live timing, per-drill work/rest, effort + notes) ── */

export interface WorkoutDrillLog {
  drillId: number
  name: string
  category: DrillCategory
  workSeconds: number        // net time spent actively doing this drill
  restSecondsAfter: number   // rest taken right after this drill (0 for the last drill)
}

export interface WorkoutSessionLog {
  date: string                // YYYY-MM-DD — the calendar day this session was run
  focus: string
  sessionType: SessionType
  drills: WorkoutDrillLog[]
  totalWorkSeconds: number
  totalRestSeconds: number
  totalSeconds: number
  effort: number               // perceived effort, 1-5
  notes: string
  completedAt: string          // ISO timestamp
}

export type WorkoutSessionsMap = Record<string, WorkoutSessionLog>

/** Formats a whole number of seconds as m:ss (or h:mm:ss once past an hour). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
