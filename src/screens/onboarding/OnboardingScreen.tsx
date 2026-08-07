import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { SetupLayout } from '@/components/layout/SetupLayout'
import { useAppData } from '@/context/AppDataContext'
import type { PlayerProfile } from '@/types'
import { Splash } from './components/Splash'
import {
  StepName, StepAge, StepPosition, StepExperience, StepGoal, StepEquipment, StepFrequency,
} from './components/OnboardingSteps'
import { TestIntro } from './components/TestIntro'

const TOTAL_STEPS = 7

export function OnboardingScreen() {
  const navigate = useNavigate()
  const { handleOnboardingComplete, handleLoginInstead } = useAppData()

  const [showSplash, setShowSplash] = useState(true)
  const [showTestIntro, setShowTestIntro] = useState(false)
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<PlayerProfile>>({})

  const set = (key: keyof PlayerProfile, val: string) => setData((d) => ({ ...d, [key]: val }))

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => Math.max(0, s - 1))

  const onLoginInstead = () => {
    handleLoginInstead()
    navigate('/auth')
  }

  if (showSplash) {
    return <Splash onContinue={() => setShowSplash(false)} />
  }

  if (showTestIntro) {
    return (
      <TestIntro
        onStartTest={() => navigate('/skill-test')}
        onSkip={() => navigate('/auth')}
      />
    )
  }

  const commonProps = {
    step,
    totalSteps: TOTAL_STEPS,
    onBack: step > 0 ? back : undefined,
  }

  let currentStepComponent = null

  switch (step) {
    case 0:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="What's your name?"
          subtitle="Your coach will personalise every session for you."
          onNext={next}
          nextDisabled={(data.name ?? '').trim().length === 0}
        >
          <StepName value={data.name ?? ''} onChange={(v) => set('name', v)} onLoginInstead={onLoginInstead} />
        </SetupLayout>
      )
      break
    case 1:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="How old are you?"
          subtitle="Age helps us set the right intensity for your workouts."
          onNext={next}
          nextDisabled={!data.age}
        >
          <StepAge value={data.age ?? ''} onChange={(v) => set('age', v)} />
        </SetupLayout>
      )
      break
    case 2:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="Your position?"
          subtitle="We tailor every drill to your role on the pitch."
          onNext={next}
          nextDisabled={!data.position}
        >
          <StepPosition value={data.position ?? ''} onChange={(v) => set('position', v)} />
        </SetupLayout>
      )
      break
    case 3:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="How long have you been playing?"
          subtitle="This helps us set your starting level accurately."
          onNext={next}
          nextDisabled={!data.experience}
        >
          <StepExperience value={data.experience ?? ''} onChange={(v) => set('experience', v)} />
        </SetupLayout>
      )
      break
    case 4:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="What do you want to improve?"
          subtitle="Your plan will be built around this goal."
          onNext={next}
          nextDisabled={!data.goal}
        >
          <StepGoal value={data.goal ?? ''} onChange={(v) => set('goal', v)} />
        </SetupLayout>
      )
      break
    case 5:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="What do you have access to?"
          subtitle="We only give you drills you can actually do."
          onNext={next}
          nextDisabled={!data.equipment}
        >
          <StepEquipment value={data.equipment ?? ''} onChange={(v) => set('equipment', v)} />
        </SetupLayout>
      )
      break
    case 6:
    default:
      currentStepComponent = (
        <SetupLayout
          {...commonProps}
          title="Training schedule"
          subtitle="How often can you train, and which is your weaker foot?"
          onNext={() => {
            handleOnboardingComplete(data as PlayerProfile)
            setShowTestIntro(true)
          }}
          nextLabel="Continue"
          nextDisabled={!data.frequency || !data.weakFoot}
        >
          <StepFrequency
            value={data.frequency ?? ''}
            weakFoot={data.weakFoot ?? ''}
            onChange={(v) => set('frequency', v)}
            onWeakFoot={(v) => set('weakFoot', v)}
          />
        </SetupLayout>
      )
      break
  }

  return (
    <ScreenContainer className="h-full">
      <div className="h-full flex flex-col overflow-y-auto scrollbar-hide" style={{ backgroundColor: 'var(--bg)' }}>
        {currentStepComponent}
      </div>
    </ScreenContainer>
  )
}