import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '@/components/layout/ScreenContainer'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui/Button'

interface ComingSoonScreenProps {
  title: string
  description?: string
}

export function ComingSoonScreen({ title, description }: ComingSoonScreenProps) {
  const navigate = useNavigate()

  return (
    <ScreenContainer className="scrollbar-hide">
      <DetailHeader title={title} onBack={() => navigate(-1)} />
      <div style={{ textAlign: 'center', marginTop: '15%' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🚧</p>
        <h2 style={{ fontSize: 'var(--fs-heading)', fontWeight: 700, marginBottom: 8 }}>
          Coming soon
        </h2>
        <p style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--color-text-tertiary)', marginBottom: 24 }}>
          {description ?? 'This test is still being built.'}
        </p>
        <Button fullWidth size="lg" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    </ScreenContainer>
  )
}