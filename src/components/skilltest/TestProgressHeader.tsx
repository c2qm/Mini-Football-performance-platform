import { ProgressBar } from '@/components/ui/ProgressBar'

interface TestProgressHeaderProps {
  current: number
  total: number
  color?: string
}

export function TestProgressHeader({ current, total, color = 'var(--color-accent)' }: TestProgressHeaderProps) {
  const percentage = Math.round((current / total) * 100)
  
  return (
    <div style={{ margin: '16px 0' }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '8px', 
          fontSize: '14px', 
          color: 'var(--color-text-secondary)',
          fontWeight: 600
        }}
      >
        <span>Shot {current} of {total}</span>
        <span>{percentage}%</span>
      </div>
      <ProgressBar value={percentage} color={color} />
    </div>
  )
}