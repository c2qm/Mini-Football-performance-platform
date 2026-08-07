import { useNavigate } from 'react-router-dom'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import '../SkillTestScreen.css'

interface SubSkill {
  id: string
  label: string
  weight: number
  available: boolean
}

const SHOOTING_SUB_SKILLS: SubSkill[] = [
  { id: 'accuracy', label: 'Accuracy', weight: 30, available: true },
  { id: 'finishing', label: 'Finishing', weight: 25, available: false },
  { id: 'consistency', label: 'Consistency', weight: 15, available: false },
  { id: 'power', label: 'Power', weight: 10, available: false },
  { id: 'weak-foot', label: 'Weak Foot', weight: 8, available: false },
  { id: 'technique', label: 'Technique', weight: 6, available: false },
  { id: 'long-shot', label: 'Long Shot', weight: 4, available: false },
  { id: 'set-pieces', label: 'Set Pieces', weight: 2, available: false },
]

export function ShootingSkillScreen() {
  const navigate = useNavigate()

  return (
    <ScreenContainer withBottomNavSpacing className="skill-test-hub scrollbar-hide">
      <div className="anim-up d0">
        <DetailHeader title="Shooting" onBack={() => navigate('/skill-test')} />
        <p className="skill-test-hub__subtitle">
          Each part below contributes to your overall Shooting score, weighted by importance.
        </p>
      </div>

      <div className="anim-up d1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {SHOOTING_SUB_SKILLS.map((sub) => (
          <Card
            key={sub.id}
            padding="md"
            interactive={sub.available}
            className={!sub.available ? 'skill-test-hub__card--disabled' : ''}
            onClick={sub.available ? () => navigate(`/skill-test/shooting/${sub.id}`) : undefined}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <p className="skill-test-hub__label">{sub.label}</p>
              <p className="skill-test-hub__subtitle" style={{ marginTop: 2 }}>{sub.weight}% of Shooting</p>
            </div>
            {!sub.available && <Tag color="neutral">Coming soon</Tag>}
          </Card>
        ))}
      </div>
    </ScreenContainer>
  )
}