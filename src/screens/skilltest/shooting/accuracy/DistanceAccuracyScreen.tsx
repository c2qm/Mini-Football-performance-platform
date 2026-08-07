import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ruler, Droplets, FastForward } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'
import { Point2D } from '@/types/shooting'

import { TestProgressHeader } from '@/components/skilltest/TestProgressHeader'
import { TestRulesCard } from '@/components/ui/TestRulesCard'
import { TestInstructionCard } from '@/components/skilltest/TestInstructionCard'
import { InteractiveGoal } from '@/components/skilltest/InteractiveGoal'
import { TestResultScreen } from '@/components/skilltest/TestResultScreen'

interface DistanceShotAttempt { score: number }
interface DistanceDrill { id: number; distance: number; target: Point2D; title: string; errorFactor: number; setNumber: number }

const GENERATE_DISTANCE_DRILLS = (): DistanceDrill[] => {
  const drills: DistanceDrill[] = []
  const zones = [{ t: 'Top Right', x: 80, y: 25 }, { t: 'Bottom Left', x: 20, y: 75 }, { t: 'Center', x: 50, y: 50 }]
  const phases = [
    { d: 11, c: 10, eF: 2.0, setNum: 1 }, 
    { d: 18, c: 10, eF: 1.5, setNum: 2 }, 
    { d: 25, c: 10, eF: 1.0, setNum: 3 }
  ]
  let id = 1
  phases.forEach(p => {
    for (let i = 0; i < p.c; i++) {
      drills.push({ id: id++, distance: p.d, target: {x: zones[i%3].x, y: zones[i%3].y}, title: zones[i%3].t, errorFactor: p.eF, setNumber: p.setNum })
    }
  })
  return drills
}
const DRILLS = GENERATE_DISTANCE_DRILLS()

export function DistanceAccuracyScreen() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState<DistanceShotAttempt[]>([])
  const [selectedResult, setSelectedResult] = useState<Point2D | null>(null)
  
  const [isResting, setIsResting] = useState<boolean>(false)
  const [restTimeLeft, setRestTimeLeft] = useState<number>(90)
  const [isFinished, setIsFinished] = useState(false)

  const currentDrill = DRILLS[currentIndex]
  const THEME_COLOR = '#3b82f6'
  const currentFeet = Math.round(currentDrill.distance * 3.28)

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
        score = Math.round(Math.max(0, 100 - (overflowError * currentDrill.errorFactor)))
      }
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
            Prepare for the next distance phase. Time remaining: <strong style={{ color: 'var(--color-text-primary)' }}>{restTimeLeft}s</strong>
          </p>
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => { setIsResting(false); setCurrentIndex(currentIndex + 1); setRestTimeLeft(90); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Resume Next Phase <FastForward size={18} />
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
        testName="Distance Accuracy" 
        score={finalScore} 
        icon={<Ruler size={28} color={THEME_COLOR} />} 
        nextTestPath="/skill-test/shooting/two-foot-accuracy" 
        nextTestName="Two Foot Accuracy" 
      />
    )
  }

  const isMissedShot = selectedResult !== null && (selectedResult.x <= 12 || selectedResult.x >= 88 || selectedResult.y <= 12)

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col" withBottomNavSpacing>
      <DetailHeader title="Distance Accuracy Test" onBack={() => navigate('/skill-test/shooting')} />
      
      <TestProgressHeader current={currentIndex + 1} total={DRILLS.length} color={THEME_COLOR} />

      {/* البطاقتان واحدة فوق الأخرى وبعرض كامل ومتناسق */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0', width: '100%' }}>
        <TestInstructionCard 
          label="Current Distance" 
          title={`${currentDrill.distance} Meters (~${currentFeet} Feet)`} 
          subtitle={`Target: ${currentDrill.title}`}
          color={THEME_COLOR}
        />

        <TestRulesCard 
          distance={`${currentDrill.distance} Meters (~${currentFeet} Feet / steps)`}
          color={THEME_COLOR}
          rules={[
            "Distance changes every 10 shots (11m ➡️ 18m ➡️ 25m) with rest between phases.",
            "Hit inside the target circle to get a full 100 score.",
            "Missed shots outside the frame always score 0."
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
          {selectedResult ? 'Confirm Distance' : 'Tap Goal'}
        </Button>
      </div>
    </ScreenContainer>
  )
}