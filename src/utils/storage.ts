import { PlayerProfile, SkillSet, DaySession, HistoryEntry, DailyLog, WorkoutSessionsMap } from '../types'

const THEME_KEY = 'footballTrainer:theme'
const ACCOUNTS_KEY = 'footballTrainer:accounts'
const SESSION_KEY = 'footballTrainer:session'

export interface AppData {
  profile: PlayerProfile
  skills: SkillSet
  plan: DaySession[]
  weekStartDate: string   // YYYY-MM-DD, the date the 12-week program started
  history: HistoryEntry[]
  dailyLog: DailyLog
  workoutSessions: WorkoutSessionsMap   // per-date saved guided-session cards (timings, effort, notes)
}

/* ─────────────────────────────────────────────────────────
   Accounts (email + password, stored locally on this device)
   ───────────────────────────────────────────────────────── */

interface Account {
  passwordHash: string
  data: AppData
}

type AccountsTable = Record<string, Account>

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Not real cryptography — this app has no server, so this only avoids storing
 * raw passwords as plain text in localStorage. Fine for on-device demo accounts,
 * not for anything security-sensitive.
 */
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i)
    hash |= 0
  }
  return `h${hash}:${password.length}`
}

function loadAccounts(): AccountsTable {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveAccounts(accounts: AccountsTable): void {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // ignore write errors, app still works in-memory for this session
  }
}

export function accountExists(email: string): boolean {
  return normalizeEmail(email) in loadAccounts()
}

export type AuthResult =
  | { ok: true; data: AppData }
  | { ok: false; reason: 'not-found' | 'wrong-password' | 'exists' }

/** Creates a brand-new account tied to an email/password and stores the given app data under it. */
export function signUp(email: string, password: string, data: AppData): AuthResult {
  const accounts = loadAccounts()
  const key = normalizeEmail(email)
  if (accounts[key]) return { ok: false, reason: 'exists' }
  accounts[key] = { passwordHash: hashPassword(password), data }
  saveAccounts(accounts)
  setSession(key)
  return { ok: true, data }
}

/** Logs into an existing account and returns whatever stats/progress were last saved for it. */
export function signIn(email: string, password: string): AuthResult {
  const accounts = loadAccounts()
  const key = normalizeEmail(email)
  const account = accounts[key]
  if (!account) return { ok: false, reason: 'not-found' }
  if (account.passwordHash !== hashPassword(password)) return { ok: false, reason: 'wrong-password' }
  setSession(key)
  return { ok: true, data: account.data }
}

/** Persists the latest app state for a logged-in account. Fails silently. */
export function saveAccountData(email: string, data: AppData): void {
  const accounts = loadAccounts()
  const key = normalizeEmail(email)
  if (!accounts[key]) return
  accounts[key] = { ...accounts[key], data }
  saveAccounts(accounts)
}

/** Reads an account's saved data without checking the password (used to restore an active session). */
export function getAccountData(email: string): AppData | null {
  const accounts = loadAccounts()
  return accounts[normalizeEmail(email)]?.data ?? null
}

export function setSession(email: string): void {
  try {
    window.localStorage.setItem(SESSION_KEY, normalizeEmail(email))
  } catch {
    // ignore
  }
}

export function getSession(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

/** Logs out only — the account and its saved stats stay on the device for next time. */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

export function loadTheme(): 'light' | 'dark' | null {
  try {
    const raw = window.localStorage.getItem(THEME_KEY)
    return raw === 'light' || raw === 'dark' ? raw : null
  } catch {
    return null
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
}
