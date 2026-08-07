import React from 'react'
import { Card } from '@/components/ui/Card'
import { ClipboardList } from 'lucide-react'
import './TestRulesCard.css'

interface TestRulesCardProps {
  distance: string | number
  color: string
  rules: React.ReactNode[]
}

export function TestRulesCard({ distance, color, rules }: TestRulesCardProps) {
  const getBackgroundColor = (hexColor: string) => {
    if (hexColor.startsWith('var')) return 'rgba(255, 255, 255, 0.1)'
    return `${hexColor}1A`
  }

  return (
    <Card padding="md" className="rules-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="rules-header">
        <h3 className="rules-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardList size={16} />
          Test Rules
        </h3>
        <span className="rules-badge" style={{ color: color, background: getBackgroundColor(color) }}>
          {distance}
        </span>
      </div>
      
      <ul className="rules-list">
        {rules.map((rule, index) => (
          <li key={index}>{rule}</li>
        ))}
      </ul>
    </Card>
  )
}