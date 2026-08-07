import { Button } from '@/components/ui/Button'
import { Target } from 'lucide-react'
import './TestIntro.css'

interface TestIntroProps {
  onStartTest: () => void
  onSkip: () => void
}

export function TestIntro({ onStartTest, onSkip }: TestIntroProps) {
  return (
    <div className="test-intro anim-fade">
      <div className="test-intro__icon anim-up d0">
        <Target size={48} color="var(--color-accent)" />
      </div>

      <h1 className="test-intro__title anim-up d1">Find out your real level</h1>
      <p className="test-intro__subtitle anim-up d2">
       Measure your true performance in every skill
      </p>

      <div className="test-intro__actions anim-up d3">
        <Button fullWidth size="lg" onClick={onStartTest}>
          Start the skill test now
        </Button>
        <button type="button" className="test-intro__skip press" onClick={onSkip}>
          Skip, I'll do it later from Progress page
        </button>
      </div>
    </div>
  )
}