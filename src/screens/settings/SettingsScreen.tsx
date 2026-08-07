import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAppData } from '@/context/AppDataContext'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import {
  ReminderConfig, NotificationPermissionState, getPermissionStatus, requestPermission,
  loadReminders, saveReminders, syncScheduledNotifications,
} from '@/utils/notifications'
import { ProfileView, AvatarCircle } from './components/ProfileView'
import { TestHistoryView } from './components/TestHistoryView'

const REMINDER_SUB: Record<string, string> = {
  daily: 'Fires once a day at the time below',
  streak: 'Fires once a day at the time below, while you have an active streak',
  weekly: 'Fires every Sunday at the time below',
}

export function SettingsScreen() {
  const { data, session, handleResetPlan, handleSignOut, handleChangeAvatar } = useAppData()
  if (!data) return null
  const player = data.profile
  const email = session ?? ''

  const { isDark, toggle } = useTheme()
  const [reminders, setReminders] = useState<ReminderConfig[]>(() => loadReminders())
  const [permission, setPermission] = useState<NotificationPermissionState>('prompt')
  const [showProfile, setShowProfile] = useState(false)
  const [showTestHistory, setShowTestHistory] = useState(false)

  useEffect(() => {
    saveReminders(reminders)
  }, [reminders])

  useEffect(() => {
    getPermissionStatus().then(setPermission)
  }, [])

  const handleToggle = async (id: ReminderConfig['id']) => {
    const target = reminders.find(r => r.id === id)
    if (!target) return

    if (!target.enabled) {
      const result = await requestPermission()
      setPermission(result)
      if (result !== 'granted') return
    }

    const next = reminders.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    setReminders(next)
    await syncScheduledNotifications(next)
  }

  const handleTimeChange = (id: ReminderConfig['id'], time: string) => {
    const next = reminders.map(r => (r.id === id ? { ...r, time } : r))
    setReminders(next)
    syncScheduledNotifications(next)
  }

  if (showProfile) {
    return <ProfileView player={player} onChangeAvatar={handleChangeAvatar} onBack={() => setShowProfile(false)} />
  }

  if (showTestHistory) {
    return <TestHistoryView onBack={() => setShowTestHistory(false)} />
  }

  return (
    <ScreenContainer withBottomNavSpacing noPadding>
      <div className="h-full overflow-y-auto scrollbar-hide pb-12" style={{ backgroundColor: 'var(--bg)', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>

        <div className="px-7 pt-5 pb-6 anim-up d0">
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Preferences
          </p>
          <h1 className="font-semibold" style={{ fontSize: 22, color: 'var(--text)' }}>Settings</h1>
        </div>

        <div className="mx-5 mb-5 anim-up d1">
          <button
            onClick={() => setShowProfile(true)}
            className="press w-full rounded-2xl p-5 flex items-center gap-3 smooth"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <AvatarCircle player={player} size={44} />
            <div className="flex-1 min-w-0 text-left">
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{player.name}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email || 'Signed in on this device'}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="mx-5 mb-5 anim-up d1">
          <button
            onClick={() => setShowTestHistory(true)}
            className="press w-full rounded-2xl p-5 flex items-center gap-3 smooth"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <span style={{ fontSize: 22 }}>📈</span>
            <div className="flex-1 min-w-0 text-left">
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Test History & Results</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>View past attempts and sub-skill scores</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="mx-5 mb-5 anim-up d1">
          <div
            className="press rounded-2xl p-5 smooth flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface)', cursor: 'pointer' }}
            onClick={toggle}
          >
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {isDark ? '🌙 Dark mode' : '☀️ Light mode'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {isDark ? 'Switch to light appearance' : 'Switch to dark appearance'}
              </p>
            </div>
            <MiniToggle 
              on={isDark} 
              onClick={(e) => { 
                e.stopPropagation()
                toggle() 
              }} 
            />
          </div>
        </div>

        <div className="px-5 mb-5 anim-up d2">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Notifications
          </p>

          {permission === 'denied' && (
            <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--surface)', borderLeft: '3px solid var(--amber)' }}>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                Notifications are turned off for this app. Enable them in Android Settings → Apps → Football Trainer → Notifications, then come back and turn a reminder on.
              </p>
            </div>
          )}

          {reminders.map((item, i) => (
            <div
              key={item.id}
              className={`py-4 anim-up d${i + 2}`}
              style={{ borderBottom: i < reminders.length - 1 ? '1px solid var(--bordersoft)' : 'none' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{REMINDER_SUB[item.id]}</p>
                </div>
                <MiniToggle on={item.enabled} onClick={() => handleToggle(item.id)} />
              </div>

              {item.enabled && (
                <div className="flex items-center gap-2 mt-3">
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Time</span>
                  <input
                    type="time"
                    value={item.time}
                    onChange={e => handleTimeChange(item.id, e.target.value)}
                    className="smooth"
                    style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text)',
                      backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)',
                      borderRadius: 10, padding: '6px 10px',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 mb-5 anim-up d5">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Training plan
          </p>
          {[
            { label: 'Plan duration',    value: '12 weeks' },
            { label: 'Sessions per week',value: '4 sessions' },
            { label: 'Session length',   value: '45 min avg' },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3.5"
              style={{ borderBottom: i < 2 ? '1px solid var(--bordersoft)' : 'none' }}
            >
              <p style={{ fontSize: 14, color: 'var(--text)' }}>{row.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="px-5 mb-8 anim-up d7">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Account
          </p>
          <button
            onClick={() => {
              if (window.confirm('This will reset your skills, plan and training history back to day one. Continue?')) {
                handleResetPlan()
              }
            }}
            className="press w-full py-3.5 rounded-2xl font-semibold smooth"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--amber)', fontSize: 14, border: '1.5px solid var(--amberbg)' }}
          >
            Reset training plan
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}>
            This resets your skills and 12-week plan, but keeps your profile.
          </p>

          <button
            onClick={() => {
              if (window.confirm('Log out? Your stats stay saved under your email — log back in anytime to continue.')) {
                handleSignOut()
              }
            }}
            className="press w-full py-3.5 rounded-2xl font-semibold smooth"
            style={{ backgroundColor: 'var(--surface)', color: '#D94040', fontSize: 14, border: '1.5px solid var(--bordersoft)' }}
          >
            Log out
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
            You'll need your email and password to log back in.
          </p>
        </div>
      </div>
    </ScreenContainer>
  )
}

function MiniToggle({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="press smooth relative"
      style={{
        width: 44, height: 26, borderRadius: 13,
        backgroundColor: on ? 'var(--green)' : 'var(--border)',
        padding: '3px',
        flexShrink: 0,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        className="smooth absolute top-[3px]"
        style={{
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: '#FFFFFF',
          left: on ? '21px' : '3px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}