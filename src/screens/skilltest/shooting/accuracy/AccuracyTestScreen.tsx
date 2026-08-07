import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Droplets, FastForward } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'
import { Point2D } from '@/types/shooting'

import { TestProgressHeader } from '@/components/skilltest/TestProgressHeader'
import { TestRulesCard } from '@/components/ui/TestRulesCard'
import { TestInstructionCard } from '@/components/skilltest/TestInstructionCard'
import { InteractiveGoal } from '@/components/skilltest/InteractiveGoal'
import { TestResultScreen } from '@/components/skilltest/TestResultScreen'

interface DetailedShotAttempt {
  targetX: number
  targetY: number
  resultX: number
  resultY: number
  distanceError: number
  targetDifficulty: number
  score: number
  setNumber: number
}

interface DrillItem {
  id: number
  setNumber: number
  target: Point2D
  difficulty: number
  title: string
}

const GENERATE_TARGET_PRECISION_DRILLS = (): DrillItem[] => {
  const drills: DrillItem[] = []
  const categories = [
    { type: 'hard', count: 8, targets: [{x: 84, y: 20}, {x: 16, y: 20}, {x: 84, y: 82}, {x: 16, y: 82}, {x: 82, y: 22}, {x: 18, y: 22}, {x: 82, y: 80}, {x: 18, y: 80}], diff: 1.0 },
    { type: 'medium', count: 8, targets: [{x: 50, y: 35}, {x: 35, y: 45}, {x: 65, y: 45}, {x: 40, y: 55}, {x: 60, y: 55}, {x: 32, y: 58}, {x: 68, y: 58}, {x: 50, y: 50}], diff: 0.8 },
    { type: 'varied', count: 8, targets: [{x: 30, y: 30}, {x: 70, y: 30}, {x: 35, y: 70}, {x: 65, y: 70}, {x: 25, y: 50}, {x: 75, y: 50}, {x: 45, y: 65}, {x: 55, y: 35}], diff: 0.9 },
  ]
  let globalIndex = 1
  categories.forEach((cat, catIdx) => {
    for (let i = 0; i < cat.count; i++) {
      drills.push({ id: globalIndex++, setNumber: catIdx + 1, target: cat.targets[i % cat.targets.length], difficulty: cat.diff, title: `${cat.type.toUpperCase()} Zone Target` })
    }
  })
  return drills
}

const DRILLS = GENERATE_TARGET_PRECISION_DRILLS()

export function AccuracyTestScreen() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [attempts, setAttempts] = useState<DetailedShotAttempt[]>([])
  const [selectedResult, setSelectedResult] = useState<Point2D | null>(null)
  
  const [isResting, setIsResting] = useState<boolean>(false)
  const [restTimeLeft, setRestTimeLeft] = useState<number>(90)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const currentDrill = DRILLS[currentIndex]
  const totalShots = DRILLS.length

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

    const distanceError = Math.sqrt(
      Math.pow(currentDrill.target.x - selectedResult.x, 2) + 
      Math.pow(currentDrill.target.y - selectedResult.y, 2)
    )

    const isInsideGoal = selectedResult.x > 12 && selectedResult.x < 88 && selectedResult.y > 12
    let score = 0

    if (isInsideGoal) {
      const targetRadius = 6
      if (distanceError <= targetRadius) {
        score = 100 
      } else {
        const overflowError = distanceError - targetRadius
        score = Math.round(Math.max(0, 100 - (overflowError * 2.5)))
      }
      score = Math.round(score * currentDrill.difficulty)
    }

    setAttempts([...attempts, { 
      targetX: currentDrill.target.x, 
      targetY: currentDrill.target.y, 
      resultX: selectedResult.x, 
      resultY: selectedResult.y, 
      distanceError: parseFloat(distanceError.toFixed(2)), 
      targetDifficulty: currentDrill.difficulty, 
      score, 
      setNumber: currentDrill.setNumber 
    }])
    
    setSelectedResult(null)

    if (currentIndex + 1 < totalShots) {
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
            <Droplets size={64} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Rest 90 Seconds</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Catch your breath and drink some water. Time remaining: <strong style={{ color: 'var(--color-text-primary)' }}>{restTimeLeft}s</strong>
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
        testName="Target Precision" 
        score={finalScore} 
        icon={<Target size={28} color="var(--color-accent)" />} 
        nextTestPath="/skill-test/shooting/corner-placement" 
        nextTestName="Corner Placement" 
      />
    )
  }

  const isMissedShot = selectedResult !== null && (selectedResult.x <= 12 || selectedResult.x >= 88 || selectedResult.y <= 12)

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col" withBottomNavSpacing>
      <DetailHeader title="Target Precision Test" onBack={() => navigate('/skill-test/shooting')} />
      
      <TestProgressHeader current={currentIndex + 1} total={totalShots} />

      {/* البطاقتان واحدة فوق الأخرى وبعرض كامل ومتناسق */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0', width: '100%' }}>
        <TestInstructionCard 
          label="Target Position" 
          title={currentDrill.title} 
        />

        <TestRulesCard 
          distance="16 Meters (~52 Feet / ~52 steps)"
          color="var(--color-accent)"
          rules={[
            "Static ball. Measure ~52 normal walking steps (~16m) from the goal line.",
            "Hit inside the target circle to get a full 100 score.",
            "Shots outside the frame or hitting the post score 0."
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