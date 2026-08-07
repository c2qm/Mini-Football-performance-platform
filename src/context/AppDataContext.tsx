import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  PlayerProfile, SkillSet, DaySession, DailyLog, HistoryEntry, WorkoutSessionLog,
  computeInitialSkills, defaultSessions, dateKey, SESSION_GAINS,
} from '@/types'
import { AppData, getSession, getAccountData, saveAccountData, clearSession } from '@/utils/storage'

/** Builds a fresh AppData (initial skills, default plan, empty history) from a just-completed onboarding profile. */
function buildInitialData(p: PlayerProfile): AppData {
  return {
    profile: p,
    skills: computeInitialSkills(p),
    plan: defaultSessions,
    weekStartDate: dateKey(new Date()),
    history: [],
    dailyLog: {},
    workoutSessions: {},
  }
}

/** Fills in fields that may be missing from data saved by an older version of the app. */
function withDefaults(d: AppData): AppData {
  return { ...d, workoutSessions: d.workoutSessions ?? {} }
}

interface AppDataCtx {
  session: string | null
  data: AppData | null
  pendingProfile: PlayerProfile | null
  buildInitialData: (profile: PlayerProfile) => AppData
  setPendingProfile: (p: PlayerProfile | null) => void
  handleOnboardingComplete: (p: PlayerProfile) => void
  handleLoginInstead: () => void
  handleRestartOnboarding: () => void
  handleAuthenticated: (email: string, accData: AppData) => void
  handleSessionComplete: (gains: Partial<SkillSet>, focus: string, sessionType: DaySession['type']) => void
  handleSaveWorkoutSession: (log: WorkoutSessionLog) => void
  handleToggleDrill: (drillId: number) => void
  handlePlanChange: (plan: DaySession[]) => void
  handleChangeDayDrills: (dayIndex: number, drillIds: number[]) => void
  handleChangeAvatar: (avatarType: 'preset' | 'photo', avatarValue: string) => void
  handleResetPlan: () => void
  handleSignOut: () => void
}

const Ctx = createContext<AppDataCtx | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<string | null>(() => getSession())
  const [data, setData] = useState<AppData | null>(() => {
    const s = getSession()
    const d = s ? getAccountData(s) : null
    return d ? withDefaults(d) : null
  })
  const [pendingProfile, setPendingProfile] = useState<PlayerProfile | null>(null)

  useEffect(() => {
    if (data && session) saveAccountData(session, data)
  }, [data, session])

  const handleOnboardingComplete = (p: PlayerProfile) => {
    // Don't create the account yet — the login screen (email + password) comes next.
    setPendingProfile(p)
  }

  const handleLoginInstead = () => {
    // Skip the rest of onboarding entirely — an existing account already has this info.
    setPendingProfile(null)
  }

  const handleRestartOnboarding = () => {
    setPendingProfile(null)
  }

  const handleAuthenticated = (email: string, accData: AppData) => {
    setSessionState(email)
    setData(withDefaults(accData))
    setPendingProfile(null)
  }

  const handleSessionComplete = (gains: Partial<SkillSet>, focus: string, sessionType: DaySession['type']) => {
    setData(prev => {
      if (!prev) return prev
      const nextSkills = { ...prev.skills }
      for (const k of Object.keys(gains) as (keyof SkillSet)[]) {
        nextSkills[k] = Math.min(99, prev.skills[k] + (gains[k] ?? 0))
      }
      const today = dateKey(new Date())
      const entry: HistoryEntry = { date: today, focus, sessionType, gains }
      const nextHistory = [entry, ...prev.history].slice(0, 30)
      const nextLog: DailyLog = {
        ...prev.dailyLog,
        [today]: { checkedDrillIds: prev.dailyLog[today]?.checkedDrillIds ?? [], completed: true },
      }
      return { ...prev, skills: nextSkills, history: nextHistory, dailyLog: nextLog }
    })
  }

  const handleSaveWorkoutSession = (log: WorkoutSessionLog) => {
    setData(prev => {
      if (!prev) return prev
      const gains = SESSION_GAINS[log.sessionType] ?? {}
      const nextSkills = { ...prev.skills }
      for (const k of Object.keys(gains) as (keyof SkillSet)[]) {
        nextSkills[k] = Math.min(99, prev.skills[k] + (gains[k] ?? 0))
      }
      const entry: HistoryEntry = { date: log.date, focus: log.focus, sessionType: log.sessionType, gains }
      const nextHistory = [entry, ...prev.history].slice(0, 30)
      const nextLog: DailyLog = {
        ...prev.dailyLog,
        [log.date]: { checkedDrillIds: log.drills.map(d => d.drillId), completed: true },
      }
      const nextWorkoutSessions = { ...prev.workoutSessions, [log.date]: log }
      return { ...prev, skills: nextSkills, history: nextHistory, dailyLog: nextLog, workoutSessions: nextWorkoutSessions }
    })
  }

  const handleToggleDrill = (drillId: number) => {
    setData(prev => {
      if (!prev) return prev
      const today = dateKey(new Date())
      const existing = prev.dailyLog[today] ?? { checkedDrillIds: [], completed: false }
      const has = existing.checkedDrillIds.includes(drillId)
      const nextIds = has
        ? existing.checkedDrillIds.filter(id => id !== drillId)
        : [...existing.checkedDrillIds, drillId]
      return {
        ...prev,
        dailyLog: { ...prev.dailyLog, [today]: { ...existing, checkedDrillIds: nextIds } },
      }
    })
  }

  const handlePlanChange = (plan: DaySession[]) => {
    setData(prev => (prev ? { ...prev, plan } : prev))
  }

  const handleChangeDayDrills = (dayIndex: number, drillIds: number[]) => {
    setData(prev => {
      if (!prev) return prev
      const nextPlan = prev.plan.map((s, i) => (i === dayIndex ? { ...s, drillIds } : s))
      return { ...prev, plan: nextPlan }
    })
  }

  const handleChangeAvatar = (avatarType: 'preset' | 'photo', avatarValue: string) => {
    setData(prev => (prev ? { ...prev, profile: { ...prev.profile, avatarType, avatarValue } } : prev))
  }

  const handleResetPlan = () => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        skills: computeInitialSkills(prev.profile),
        plan: defaultSessions,
        weekStartDate: dateKey(new Date()),
        history: [],
        dailyLog: {},
        workoutSessions: {},
      }
    })
  }

  const handleSignOut = () => {
    clearSession()
    setSessionState(null)
    setData(null)
    setPendingProfile(null)
  }

  return (
    <Ctx.Provider
      value={{
        session, data, pendingProfile,
        buildInitialData, setPendingProfile,
        handleOnboardingComplete, handleLoginInstead, handleRestartOnboarding,
        handleAuthenticated, handleSessionComplete, handleSaveWorkoutSession,
        handleToggleDrill, handlePlanChange, handleChangeDayDrills,
        handleChangeAvatar, handleResetPlan, handleSignOut,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAppData(): AppDataCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
