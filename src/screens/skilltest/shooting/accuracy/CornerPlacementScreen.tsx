import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Goal, Droplets, FastForward } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'
import { Point2D } from '@/types/shooting'

import { TestProgressHeader } from '@/components/skilltest/TestProgressHeader'
import { TestRulesCard } from '@/components/ui/TestRulesCard'
import { TestInstructionCard } from '@/components/skilltest/TestInstructionCard'
import { InteractiveGoal } from '@/components/skilltest/InteractiveGoal'
import { TestResultScreen } from '@/components/skilltest/TestResultScreen'

interface CornerShotAttempt { score: number }
interface CornerDrill { id: number; zone: string; target: Point2D; diff: number; setNumber: number }

const GENERATE_CORNER_DRILLS = (): CornerDrill[] => {
  const drills: CornerDrill[] = []
  const corners = [ 
    { zone: 'Top Left', target: { x: 16, y: 20 }, diff: 1.0 }, 
    { zone: 'Top Right', target: { x: 84, y: 20 }, diff: 1.0 }, 
    { zone: 'Bottom Left', target: { x: 16, y: 82 }, diff: 0.9 }, 
    { zone: 'Bottom Right', target: { x: 84, y: 82 }, diff: 0.9 } 
  ]
  let index = 1
  for (let r = 0; r < 5; r++) {
    corners.forEach(c => {
      const setNumber = index <= 10 ? 1 : 2
      drills.push({ id: index++, ...c, setNumber })
    })
  }
  return drills
}

const DRILLS = GENERATE_CORNER_DRILLS()

export function CornerPlacementScreen() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState<CornerShotAttempt[]>([])
  const [selectedResult, setSelectedResult] = useState<Point2D | null>(null)
  
  const [isResting, setIsResting] = useState<boolean>(false)
  const [restTimeLeft, setRestTimeLeft] = useState<number>(90)
  const [isFinished, setIsFinished] = useState(false)

  const currentDrill = DRILLS[currentIndex]
  const THEME_COLOR = '#ff9800'

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
        score = Math.round(Math.max(0, 100 - (overflowError * 2.5)))
      }
      score = Math.round(score * currentDrill.diff)
    }

    setAttempts([...attempts, { score }])
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Rest 90 Seconds</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Catch your breath. Time remaining: <strong style={{ color: 'var(--color-text-primary)' }}>{restTimeLeft}s</strong>
          </p>
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => { setIsResting(false); setCurrentIndex(currentIndex + 1); setRestTimeLeft(90); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Resume Test Now <FastForward size={18} />
            </div>
          </Button>
        </div>
      </ScreenContainer>
    )
  }

  if (isFinished) {
    const finalScore = Math.round(attempts.reduce((a, c) => a + c.score, 0) / attempts.length)
    return (
      <TestResultScreen 
        testName="Corner Placement" 
        score={finalScore} 
        icon={<Goal size={28} color={THEME_COLOR} />} 
        nextTestPath="/skill-test/shooting/distance-accuracy" 
        nextTestName="Distance Accuracy" 
      />
    )
  }

  const isMissedShot = selectedResult !== null && (selectedResult.x <= 12 || selectedResult.x >= 88 || selectedResult.y <= 12)

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col" withBottomNavSpacing>
      <DetailHeader title="Corner Placement Test" onBack={() => navigate('/skill-test/shooting')} />
      
      <TestProgressHeader current={currentIndex + 1} total={DRILLS.length} color={THEME_COLOR} />

      {/* البطاقتان واحدة فوق الأخرى وبعرض كامل ومتناسق */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0', width: '100%' }}>
        <TestInstructionCard 
          label="Target Zone" 
          title={currentDrill.zone} 
          color={THEME_COLOR}
        />

        <TestRulesCard 
          distance="18 Meters (~59 Feet / ~59 steps)"
          color={THEME_COLOR}
          rules={[
            "Aim strictly for the 4 corners of the goal. Step out ~59 walking steps (~18m).",
            "Includes 1 structured rest break halfway through the drill.",
            "Hit inside the target circle to get a full 100 score."
          ]}
        />
      </div>

      {/* المرمى في الأسفل بمساحة واضحة */}
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
          {selectedResult ? 'Confirm Corner' : 'Tap Goal'}
        </Button>
      </div>
    </ScreenContainer>
  )
}