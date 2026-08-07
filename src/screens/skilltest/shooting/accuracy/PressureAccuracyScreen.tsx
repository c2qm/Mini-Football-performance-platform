import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, Droplets, FastForward } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'
import { Point2D } from '@/types/shooting'

import { TestProgressHeader } from '@/components/skilltest/TestProgressHeader'
import { TestRulesCard } from '@/components/ui/TestRulesCard'
import { TestInstructionCard } from '@/components/skilltest/TestInstructionCard'
import { InteractiveGoal } from '@/components/skilltest/InteractiveGoal'
import { TestResultScreen } from '@/components/skilltest/TestResultScreen'

interface PressureShotAttempt { score: number }
interface PressureDrill { id: number; target: Point2D; title: string; setNumber: number }

const GENERATE_PRESSURE_DRILLS = (): PressureDrill[] => {
  const drills: PressureDrill[] = []
  const zones = [{ t: 'Top Right', x: 84, y: 20 }, { t: 'Bottom Left', x: 16, y: 82 }, { t: 'Center', x: 50, y: 50 }]
  for (let i = 0; i < 20; i++) {
    const setNumber = i < 10 ? 1 : 2
    drills.push({ id: i + 1, target: {x: zones[i%3].x, y: zones[i%3].y}, title: zones[i%3].t, setNumber })
  }
  return drills
}
const DRILLS = GENERATE_PRESSURE_DRILLS()

export function PressureAccuracyScreen() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attempts, setAttempts] = useState<PressureShotAttempt[]>([])
  
  const [isDrillActive, setIsDrillActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3000)
  const [selectedResult, setSelectedResult] = useState<Point2D | null>(null)
  
  const [isResting, setIsResting] = useState<boolean>(false)
  const [restTimeLeft, setRestTimeLeft] = useState<number>(90)
  const [isFinished, setIsFinished] = useState(false)

  const currentDrill = DRILLS[currentIndex]
  const THEME_COLOR = timeLeft === 0 && isDrillActive ? '#ef4444' : (timeLeft > 1500 ? '#10b981' : '#eab308')

  useEffect(() => {
    let timerId: NodeJS.Timeout
    if (isDrillActive && !selectedResult && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 50) { clearInterval(timerId); return 0 }
          return prev - 50
        })
      }, 50)
    }
    return () => clearInterval(timerId)
  }, [isDrillActive, selectedResult, timeLeft])

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
    let score = 0
    if (selectedResult) {
      const err = Math.sqrt(Math.pow(currentDrill.target.x - selectedResult.x, 2) + Math.pow(currentDrill.target.y - selectedResult.y, 2))
      const isInsideGoal = selectedResult.x > 12 && selectedResult.x < 88 && selectedResult.y > 12
      
      if (isInsideGoal && timeLeft > 0) {
        const targetRadius = 6
        let accScore = 0

        if (err <= targetRadius) {
          accScore = 100
        } else {
          const overflowError = err - targetRadius
          accScore = Math.max(0, 100 - (overflowError * 2.5))
        }

        let spdScore = (timeLeft / 3000) * 100
        score = Math.round((accScore * 0.7) + (spdScore * 0.3))
      }
    }
    
    setAttempts([...attempts, { score }])
    setIsDrillActive(false)
    setSelectedResult(null)
    setTimeLeft(3000)
    
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
            <Droplets size={64} color="#ef4444" />
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
        testName="Pressure Accuracy" 
        score={finalScore} 
        icon={<Timer size={28} color="#ef4444" />}
      />
    )
  }

  const isMissedShot = selectedResult !== null && (selectedResult.x <= 12 || selectedResult.x >= 88 || selectedResult.y <= 12)
  const isTimeOut = timeLeft === 0 && isDrillActive

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col" withBottomNavSpacing>
      <DetailHeader title="Pressure Accuracy Test" onBack={() => navigate('/skill-test/shooting')} />
      
      <TestProgressHeader current={currentIndex + 1} total={DRILLS.length} color="#ef4444" />

      {/* البطاقتان واحدة فوق الأخرى وبعرض كامل ومتناسق في الأعلى */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0', width: '100%' }}>
        <TestInstructionCard 
          label="Timer (Max 3.0s)" 
          title={isTimeOut ? 'TIME OUT!' : `${(timeLeft / 1000).toFixed(1)}s`}
          color={THEME_COLOR}
        />

        <TestRulesCard 
          distance="16 Meters (~52 Feet / ~52 steps)"
          color="#ef4444"
          rules={[
            <span key="rule1">Target reveals suddenly. You have <strong style={{color: '#ef4444'}}>3 seconds</strong> to shoot. Step out ~52 steps.</span>,
            "Includes 1 structured rest break halfway through.",
            "Score is calculated based on 70% Accuracy + 30% Execution Speed."
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
            isMissed={isMissedShot || isTimeOut}
            targetColor="#ef4444"
            showTarget={isDrillActive}
            isPulse={isDrillActive}
            isDisabled={!isDrillActive}
          />
        </div>
      </div>

      {/* زر التأكيد والبدء */}
      <div style={{ marginTop: '8px' }}>
        {!isDrillActive ? (
          <Button fullWidth size="lg" onClick={() => { setIsDrillActive(true); setTimeLeft(3000); setSelectedResult(null) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Reveal Target & Start Timer <Timer size={18} />
            </div>
          </Button>
        ) : (
          <Button fullWidth size="lg" disabled={!selectedResult && !isTimeOut} onClick={handleConfirmShot}>
            {isTimeOut && !selectedResult ? 'Record Time Out (0)' : (selectedResult ? 'Confirm Shot' : 'Tap Goal Quickly!')}
          </Button>
        )}
      </div>
    </ScreenContainer>
  )
}