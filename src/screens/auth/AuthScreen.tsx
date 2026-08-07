import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAppData } from '@/context/AppDataContext'
import { isValidEmail, signIn, signUp } from '@/utils/storage'
import './AuthScreen.css'

type Mode = 'signup' | 'login'

export function AuthScreen() {
  const navigate = useNavigate()
  const { pendingProfile, buildInitialData, handleAuthenticated, handleRestartOnboarding } = useAppData()

  const [mode, setMode] = useState<Mode>(pendingProfile ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const name = pendingProfile?.name?.trim() || ''

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setConfirmPassword('')
  }

  const onRestartOnboarding = () => {
    handleRestartOnboarding()
    navigate('/onboarding')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords don\u2019t match.')
        setSubmitting(false)
        return
      }
      if (!pendingProfile) {
        setError('Something went wrong with your profile. Please restart onboarding.')
        setSubmitting(false)
        return
      }
      const fresh = buildInitialData(pendingProfile)
      const result = signUp(trimmedEmail, password, fresh)
      setSubmitting(false)
      if (!result.ok) {
        setError('An account with this email already exists. Log in instead.')
        setMode('login')
        return
      }
      handleAuthenticated(trimmedEmail, result.data)
      navigate('/today')
    } else {
      const result = signIn(trimmedEmail, password)
      setSubmitting(false)
      if (!result.ok) {
        setError(result.reason === 'wrong-password' ? 'Incorrect password.' : 'No account found with this email.')
        return
      }
      handleAuthenticated(trimmedEmail, result.data)
      navigate('/today')
    }
  }

  return (
    <ScreenContainer className="auth-screen scrollbar-hide h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="anim-up d0">
          <div className="auth-screen__icon">
            <Lock size={22} strokeWidth={1.8} />
          </div>
          <h2 className="auth-screen__title">
            {mode === 'signup' ? (name ? `One last step, ${name}` : 'Create your account') : 'Welcome back'}
          </h2>
          <p className="auth-screen__subtitle">
            {mode === 'signup'
              ? 'Save your plan with an email and password so your stats stay with you.'
              : 'Log in to pick up right where you left off.'}
          </p>
        </div>

        <div className="anim-up d1">
          <SegmentedControl
            options={[
              { value: 'signup', label: 'Sign up' },
              { value: 'login', label: 'Log in' },
            ]}
            value={mode}
            onChange={switchMode}
          />
        </div>

        {mode === 'signup' && !pendingProfile ? (
          <div className="auth-screen__notice anim-up d2">
            <p>To create a new account we first need a few quick details about you. It only takes a minute.</p>
            <Button fullWidth onClick={onRestartOnboarding}>
              Start onboarding
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-screen__form anim-up d2 pb-8">
            <Input
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === 'signup' && (
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {error && (
              <div className="auth-screen__error anim-up d0">
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={submitting}>
              {submitting ? 'Please wait\u2026' : mode === 'signup' ? 'Create account & save my plan' : 'Log in'}
            </Button>

            <p className="auth-screen__footnote">
              {mode === 'signup'
                ? 'Your stats and progress will be tied to this email and password on this device.'
                : 'This restores the stats saved under this account, not the answers you just entered.'}
            </p>
          </form>
        )}
      </div>
    </ScreenContainer>
  )
}