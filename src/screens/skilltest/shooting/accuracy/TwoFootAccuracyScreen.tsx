import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Droplets, FastForward } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'
import { Point2D } from '@/types/shooting'

import { TestProgressHeader } from '@/components/skilltest/TestProgressHeader'
import { TestRulesCard } from '@/components/ui/TestRulesCard'
import { TestInstructionCard } from '@/components/skilltest/TestInstructionCard'
import { InteractiveGoal } from '@/components/skilltest/InteractiveGoal'
import { TestResultScreen } from '@/components/skilltest/TestResultScreen'

interface TwoFootShotAttempt { foot: string; score: number }
interface TwoFootDrill { id: number; foot: string; target: Point2D; title: string; setNumber: number }

const GENERATE_TWO_FOOT_DRILLS = (): TwoFootDrill[] => {
  const drills: TwoFootDrill[] = []
  const zones = [
    { t: 'Top Right', x: 80, y: 25 }, { t: 'Bottom Left', x: 20, y: 75 },
    { t: 'Center Right', x: 70, y: 50 }, { t: 'Top Left', x: 20, y: 25 },
    { t: 'Bottom Right', x: 80, y: 75 }
  ]
  let id = 1
  zones.forEach(z => drills.push({ id: id++, foot: 'Strong', target: {x: z.x, y: z.y}, title: z.t, setNumber: 1 }))
  zones.forEach(z => drills.push({ id: id++, foot: 'Weak', target: {x: z.x, y: z.y}, title: z.t, setNumber: 2 }))
  return drills
}
const DRILLS = GENERATE_TWO_FOOT_DRILLS()

export function TwoFootAccuracyScreen() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState<TwoFootShotAttempt[]>([])
  const [selectedResult, setSelectedResult] = useState<Point2D | null>(null)
  
  const [isResting, setIsResting] = useState<boolean>(false)
  const [restTimeLeft, setRestTimeLeft] = useState<number>(90)
  const [isFinished, setIsFinished] = useState(false)

  const currentDrill = DRILLS[currentIndex]
  const isWeak = currentDrill.foot === 'Weak'
  const THEME_COLOR = isWeak ? '#8b5cf6' : '#10b981'

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isResting && restTimeLeft > 0) {
      timer = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsResting(false)
            return 90
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isResting, restTimeLeft])

  const handleConfirmShot = () => {
    if (!selectedResult) return

    const err = Math.sqrt(
      Math.pow(currentDrill.target.x - selectedResult.x, 2) + 
      Math.pow(currentDrill.target.y - selectedResult.y, 2)
    )

    const isInsideGoal = selectedResult.x > 12 && selectedResult.x < 88 && selectedResult.y > 12
    let score = 0

    if (isInsideGoal) {
      const targetRadius = 6
      if (err <= targetRadius) {
        score = 100
      } else {
        const overflowError = err - targetRadius
        score = Math.round(Math.max(0, 100 - (overflowError * 1.5)))
      }
    }

    setAttempts([...attempts, { foot: currentDrill.foot, score }])
    setSelectedResult(null)
    
    if (currentIndex + 1 < DRILLS.length) {
      if (DRILLS[currentIndex + 1].setNumber !== currentDrill.setNumber) {
        setIsResting(true)
        setRestTimeLeft(90)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else {
      setIsFinished(true)
    }
  }

  if (isResting) {
    return (
      <ScreenContainer className="scrollbar-hide" withBottomNavSpacing>
        <DetailHeader title="Rest Period" onBack={() => navigate('/skill-test/shooting')} />
        <div style={{ textAlign: 'center', marginTop: '15%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Droplets size={64} color={THEME_COLOR} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Rest 90 Seconds (Switching Foot)</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Rest before starting the Weak Foot set. Time remaining: <strong style={{ color: 'var(--color-text-primary)' }}>{restTimeLeft}s</strong>
          </p>
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => { setIsResting(false); setCurrentIndex(currentIndex + 1); setRestTimeLeft(90); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Start Weak Foot Set <FastForward size={18} />
            </div>
          </Button>
        </div>
      </ScreenContainer>
    )
  }

  if (isFinished) {
    const strong = attempts.filter(a => a.foot === 'Strong')
    const weak = attempts.filter(a => a.foot === 'Weak')
    const sScore = strong.length ? Math.round(strong.reduce((a, c) => a + c.score, 0) / strong.length) : 0
    const wScore = weak.length ? Math.round(weak.reduce((a, c) => a + c.score, 0) / weak.length) : 0
    const balance = 100 - Math.abs(sScore - wScore)
    const finalScore = Math.round((wScore * 0.5) + (sScore * 0.3) + (balance * 0.2))

    return (
      <TestResultScreen 
        testName="Two Foot Accuracy" 
        score={finalScore} 
        icon={<Scale size={28} color="#10b981" />} 
        nextTestPath="/skill-test/shooting/moving-accuracy" 
        nextTestName="Moving Accuracy" 
      />
    )
  }

  const isMissedShot = selectedResult !== null && (selectedResult.x <= 12 || selectedResult.x >= 88 || selectedResult.y <= 12)

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col" withBottomNavSpacing>
      <DetailHeader title="Two Foot Accuracy Test" onBack={() => navigate('/skill-test/shooting')} />
      
      <TestProgressHeader current={currentIndex + 1} total={DRILLS.length} color={THEME_COLOR} />

      {/* البطاقتان واحدة فوق الأخرى وبعرض كامل ومتناسق في الأعلى */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0', width: '100%' }}>
        <TestInstructionCard 
          label="Use Foot" 
          title={`${currentDrill.foot} Foot`}
          subtitle={`Target: ${currentDrill.title}`}
          color={THEME_COLOR}
        />

        <TestRulesCard 
          distance="16 Meters (~52 Feet / ~52 steps)"
          color={THEME_COLOR}
          rules={[
            "Use ONLY the specified foot. Measure ~52 walking steps (~16m) from goal.",
            "Includes a 90s rest break between Strong Foot and Weak Foot sets.",
            "Your final score evaluates the BALANCE between your strong and weak foot."
          ]}
        />
      </div>

      {/* المرمى في الأسفل بمساحة واضحة وثابتة */}
      <div style={{ margin: '6px 0', display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '380px', height: '210px' }}>
          <InteractiveGoal 
            targetX={currentDrill.target.x}
            targetY={currentDrill.target.y}
            resultX={selectedResult?.x}
            resultY={selectedResult?.y}
            onInteract={(x, y) => setSelectedResult({ x, y })}
            isMissed={isMissedShot}
            targetColor={THEME_COLOR}
          />
        </div>
      </div>

      {/* زر التأكيد */}
      <div style={{ marginTop: '8px' }}>
        <Button fullWidth size="lg" disabled={!selectedResult} onClick={handleConfirmShot}>
          {selectedResult ? 'Confirm Shot' : 'Tap Goal'}
        </Button>
      </div>
    </ScreenContainer>
  )
}