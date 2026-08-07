import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'

interface TestHistoryItem {
  testName: string
  score: number
  date: string
}

interface TestHistoryViewProps {
  onBack: () => void
}

const ALL_ACCURACY_TESTS = [
  'Target Precision',
  'Corner Placement',
  'Distance Accuracy',
  'Two Foot Accuracy',
  'Moving Accuracy',
  'Pressure Accuracy'
]

export function TestHistoryView({ onBack }: TestHistoryViewProps) {
  const history: TestHistoryItem[] = JSON.parse(localStorage.getItem('skill_test_history') || '[]')

  // تجميع السجل حسب تاريخ اليوم
  const groupedByDate: { [date: string]: TestHistoryItem[] } = {}
  history.forEach(item => {
    const day = item.date ? item.date.split('T')[0] : 'Recent'
    if (!groupedByDate[day]) {
      groupedByDate[day] = []
    }
    groupedByDate[day].push(item)
  })

  const dates = Object.keys(groupedByDate).sort().reverse()

  return (
    <ScreenContainer className="scrollbar-hide" withBottomNavSpacing noPadding>
      <DetailHeader title="Test History & Results" onBack={onBack} />

      <div className="px-5 pt-4 pb-8 space-y-4">
        {dates.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>No test history found yet. Complete a skill test to see your results here.</p>
          </Card>
        ) : (
          dates.map(dateStr => {
            const tests = groupedByDate[dateStr]
            
            // خريطة لتخزين نتائج الاختبارات الخاصة بهذا التاريخ
            const testMap: { [name: string]: number } = {}
            tests.forEach(t => {
              testMap[t.testName] = t.score
            })

            // حساب متوسط سب سكيل Accuracy بناءً على الاختبارات المنجزة
            const scoresList = Object.values(testMap)
            const totalScore = scoresList.reduce((acc, score) => acc + score, 0)
            const accuracyAvg = scoresList.length > 0 ? Math.round(totalScore / scoresList.length) : 0
            const shootingScore = Math.round(accuracyAvg * 0.3)

            const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <Card key={dateStr} padding="lg" className="mb-4">
                <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>📅 {formattedDate !== 'Invalid Date' ? formattedDate : dateStr}</span>
                  <Tag color="green">Completed</Tag>
                </div>

                {/* نتيجة اختبار التسديد الرئيسية */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>⚽ Shooting Skill Score</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#E08030' }}>{shootingScore} / 30</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Weighted contribution from accuracy tests</p>
                </div>

                {/* سب سكيل Accuracy */}
                <div className="pl-3 mt-3 pt-3" style={{ borderLeft: '2px solid var(--color-accent)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>🎯 Accuracy (Sub-skill · 30%)</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{accuracyAvg} / 100</span>
                  </div>

                  {/* عرض اختبارات الـ Accuracy الستة كاملة مع نتيجة كل اختبار على حدة */}
                  <div className="space-y-1.5 mt-2 pl-2">
                    {ALL_ACCURACY_TESTS.map((testName, idx) => {
                      const hasResult = testMap[testName] !== undefined
                      const scoreValue = hasResult ? testMap[testName] : 'Not tested'

                      return (
                        <div key={idx} className="flex items-center justify-between py-1" style={{ borderBottom: idx < ALL_ACCURACY_TESTS.length - 1 ? '1px dashed var(--bordersoft)' : 'none' }}>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>• {testName}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: hasResult ? 'var(--text)' : 'var(--muted)' }}>
                            {hasResult ? `${scoreValue} / 100` : scoreValue}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </ScreenContainer>
  )
}