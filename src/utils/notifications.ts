/**
 * Local notifications for the training reminders — implemented with the Capacitor
 * Local Notifications plugin (@capacitor/local-notifications).
 *
 * This is real, OS-scheduled notification delivery:
 *  - Each reminder is scheduled directly with the Android OS (AlarmManager under the
 *    hood, via the plugin), so it fires at its HH:MM time even if the app has been
 *    swiped away or fully closed — no JS needs to be running for it to go off.
 *  - There is no browser Notification API, no Service Worker, and no Push API involved.
 *    None of those exist inside a Capacitor WebView, and none of them can wake a fully
 *    closed native app the way a scheduled local notification can. This file only talks
 *    to the native plugin.
 *  - On Android 13+ (API 33+), POST_NOTIFICATIONS is a runtime permission and must be
 *    requested explicitly at runtime — requestPermission() below does that through the
 *    plugin, which is the correct, Play-Store-safe way to do it.
 */

import { LocalNotifications, type PermissionStatus } from '@capacitor/local-notifications'

export type ReminderId = 'daily' | 'streak' | 'weekly'

export interface ReminderConfig {
  id: ReminderId
  label: string
  enabled: boolean
  time: string // "HH:MM", 24h
}

export type NotificationPermissionState = PermissionStatus['display']

const STORAGE_KEY = 'footballTrainer:notifications'
const CHANNEL_ID = 'training-reminders'

// Fixed numeric ids the plugin needs — one per reminder slot, stable across app runs so
// re-scheduling an existing reminder replaces its alarm instead of stacking a duplicate.
const NOTIFICATION_IDS: Record<ReminderId, number> = {
  daily: 1001,
  streak: 1002,
  weekly: 1003,
}

// Capacitor's `weekday` field is 1–7 with 1 = Sunday, matching the plugin's documented range.
const WEEKLY_WEEKDAY = 1

const DEFAULTS: ReminderConfig[] = [
  { id: 'daily', label: 'Daily training reminder', enabled: false, time: '07:30' },
  { id: 'streak', label: 'Session streak alert', enabled: false, time: '18:00' },
  { id: 'weekly', label: 'Weekly review', enabled: false, time: '09:00' },
]

const REMINDER_COPY: Record<ReminderId, { title: string; body: string }> = {
  daily: { title: 'Time to train ⚽', body: "Today's session is ready — let's go." },
  streak: { title: "You're on a roll 🔥", body: 'Keep your streak alive with a quick session.' },
  weekly: { title: 'Weekly review 📊', body: 'See how your skills grew this week.' },
}

export function loadReminders(): ReminderConfig[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS.map(d => ({ ...d }))
    const parsed = JSON.parse(raw) as Partial<ReminderConfig>[]
    // merge with defaults so newly-added reminder types (or old saved fields) don't crash
    return DEFAULTS.map(d => {
      const saved = parsed.find(p => p.id === d.id)
      return saved ? { ...d, ...saved } : { ...d }
    })
  } catch {
    return DEFAULTS.map(d => ({ ...d }))
  }
}

export function saveReminders(reminders: ReminderConfig[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  } catch {
    // ignore write errors
  }
}

/** One-time setup for the Android notification channel (users can manage it in system settings). */
let channelReady: Promise<void> | null = null
function ensureChannel(): Promise<void> {
  if (!channelReady) {
    channelReady = LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Training reminders',
      description: 'Daily and weekly training reminders',
      importance: 4, // IMPORTANCE_HIGH — shows as a heads-up notification
      visibility: 1, // VISIBILITY_PUBLIC
      vibration: true,
    }).catch(() => {
      // Harmless if it fails (e.g. web preview, or Android versions that don't use channels) —
      // scheduling still works without it there.
    })
  }
  return channelReady
}

/** Current OS permission state, without prompting the user. */
export async function getPermissionStatus(): Promise<NotificationPermissionState> {
  const status = await LocalNotifications.checkPermissions()
  return status.display
}

/** Prompts for permission if needed (Android 13+ shows the real system dialog once). */
export async function requestPermission(): Promise<NotificationPermissionState> {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return 'granted'
  const result = await LocalNotifications.requestPermissions()
  return result.display
}

async function cancelReminder(id: ReminderId): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_IDS[id] }] })
}

async function scheduleReminder(reminder: ReminderConfig): Promise<void> {
  await cancelReminder(reminder.id) // clear any previous alarm for this slot first

  if (!reminder.enabled) return

  const [hourStr, minuteStr] = reminder.time.split(':')
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return

  const copy = REMINDER_COPY[reminder.id]
  await ensureChannel()

  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIFICATION_IDS[reminder.id],
        title: copy.title,
        body: copy.body,
        channelId: CHANNEL_ID,
        schedule: {
          // Leaving out year/month/day makes this repeat automatically on every match —
          // daily at hour:minute, or weekly on `weekday` at hour:minute.
          on: reminder.id === 'weekly' ? { weekday: WEEKLY_WEEKDAY, hour, minute } : { hour, minute },
          allowWhileIdle: true, // keep firing even under Android Doze / battery optimization
        },
      },
    ],
  })
}

/**
 * Reconciles native scheduled notifications with the given reminders: (re)schedules every
 * enabled reminder at its saved time and cancels every disabled one. Safe to call as often as
 * needed — on app start, and any time a reminder is toggled or its time changes — since
 * scheduling an id again simply replaces its previous alarm rather than duplicating it.
 */
export async function syncScheduledNotifications(reminders: ReminderConfig[]): Promise<void> {
  await Promise.all(reminders.map(r => scheduleReminder(r)))
}
