import { useNavigate } from 'react-router-dom'
import { useAppData } from '@/context/AppDataContext'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'

import imgShooting from '@/assets/6.webp'
import imgPassing from '@/assets/7.webp'
import imgVision from '@/assets/8.webp'
import imgPace from '@/assets/9.webp'
import imgDribbling from '@/assets/10.webp'
import imgDefending from '@/assets/11.webp'

import './SkillTestScreen.css'

interface SkillCategory {
  id: string
  title: string
  path: string
  icon: React.ReactNode
  isComingSoon?: boolean
}

// دالة مساعدة لتغليف الصورة بنفس تصميم الحاضنة النظيفة
const renderIcon = (src: string, alt: string) => (
  <div style={{
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'var(--color-bg-subtle, #f4f4f5)',
    border: '1px solid var(--color-border, #e5e5e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden'
  }}>
    <img 
      src={src} 
      alt={alt} 
      style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
      loading="lazy"
    />
  </div>
)

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'shooting',
    title: 'Shooting',
    path: '/skill-test/shooting',
    icon: renderIcon(imgShooting, 'Shooting'), // رقم 6 للتسديد
  },
  {
    id: 'passing',
    title: 'Passing',
    path: '#',
    icon: renderIcon(imgPassing, 'Passing'), // رقم 7 للتمرير
    isComingSoon: true,
  },
  {
    id: 'vision',
    title: 'Vision',
    path: '#',
    icon: renderIcon(imgVision, 'Vision'), // رقم 8 للرؤية
    isComingSoon: true,
  },
  {
    id: 'pace',
    title: 'Pace',
    path: '#',
    icon: renderIcon(imgPace, 'Pace'), // رقم 9 للسرعة
    isComingSoon: true,
  },
  {
    id: 'dribbling',
    title: 'Dribbling',
    path: '#',
    icon: renderIcon(imgDribbling, 'Dribbling'), // رقم 10 للدربل
    isComingSoon: true,
  },
  {
    id: 'defending',
    title: 'Defending',
    path: '#',
    icon: renderIcon(imgDefending, 'Defending'), // رقم 11 للدفاع
    isComingSoon: true,
  },
]

export function SkillTestScreen() {
  const navigate = useNavigate()
  const { data } = useAppData()

  // إذا كان المستخدم مسجل دخول بالفعل (وصل من صفحة Progress عبر "Retake Test")
  // يرجعه زر الرجوع لصفحة Progress. أما إذا كان بخطوات الـ onboarding
  // ولسا ما سجل حساب، يرجعه لصفحة تسجيل الدخول كالمعتاد.
  const handleBack = () => navigate(data ? '/progress' : '/auth')

  return (
    <ScreenContainer className="scrollbar-hide" withBottomNavSpacing>
      <DetailHeader 
        title="Skill Test" 
        onBack={handleBack} 
      />

      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        Choose a skill to test. More skills are being added over time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {SKILL_CATEGORIES.map((skill) => (
          <div
            key={skill.id}
            onClick={() => !skill.isComingSoon && navigate(skill.path)}
            style={{
              background: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e5e5e5)',
              borderRadius: '16px',
              padding: '20px',
              cursor: skill.isComingSoon ? 'default' : 'pointer',
              opacity: skill.isComingSoon ? 0.7 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {skill.icon}
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {skill.title}
              </h3>
            </div>

            {skill.isComingSoon && (
              <span style={{
                alignSelf: 'flex-start',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-subtle, #f4f4f5)',
                padding: '4px 10px',
                borderRadius: '20px',
                marginTop: '12px'
              }}>
                Coming soon
              </span>
            )}
          </div>
        ))}
      </div>
    </ScreenContainer>
  )
}