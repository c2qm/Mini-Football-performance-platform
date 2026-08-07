import { useNavigate } from 'react-router-dom'
import { Trophy, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { Button } from '@/components/ui/Button'
import { ReactNode } from 'react'

interface TestResultItem {
  name: string
  score: number
}

interface TestResultScreenProps {
  testName: string
  score: number
  icon?: ReactNode
  breakdown?: TestResultItem[]
  nextTestPath?: string
  nextTestName?: string
}

export function TestResultScreen({
  testName,
  score,
  icon,
  breakdown = [],
}: TestResultScreenProps) {
  const navigate = useNavigate()

  return (
    <ScreenContainer className="scrollbar-hide flex flex-col items-center justify-between py-6 text-center" withBottomNavSpacing>
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        {/* أيقونة الإنجاز */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
          {icon || <Trophy size={32} className="text-emerald-500" />}
        </div>
        
        <h1 className="text-2xl font-bold mb-1">Test Completed!</h1>
        <p className="text-sm text-var(--color-text-secondary, #888) mb-6">
          You have successfully finished all {testName} tests.
        </p>

        {/* بطاقة النتيجة الإجمالية للأكروسي */}
        <div className="w-full bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm flex flex-col items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Overall Accuracy Score
          </span>
          <div className="text-4xl font-extrabold text-emerald-500 flex items-center gap-2">
            {score}%
          </div>
        </div>

        {/* تفاصيل نتيجة كل اختبار فرعي */}
        {breakdown.length > 0 && (
          <div className="w-full text-left mb-6">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Individual Test Results</h3>
            <div className="flex flex-col gap-2">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* زر الانتقال إلى صفحة البروجرس */}
      <div className="w-full max-w-md mt-6">
        <Button 
          fullWidth 
          size="lg" 
          onClick={() => navigate('/progress')}
        >
          <div className="flex items-center justify-center gap-2">
            View Progress <ArrowRight size= {18} />
          </div>
        </Button>
      </div>
    </ScreenContainer>
  )
}