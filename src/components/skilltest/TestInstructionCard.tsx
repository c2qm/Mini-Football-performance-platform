import React from 'react'
import { Card } from '@/components/ui/Card'
import './TestInstructionCard.css'

interface TestInstructionCardProps {
  label: string
  title: React.ReactNode
  subtitle?: string
  color?: string
}

export function TestInstructionCard({ label, title, subtitle, color = 'var(--color-accent)' }: TestInstructionCardProps) {
  const isCustomColor = color !== 'var(--color-accent)'
  
  return (
    <Card 
      padding="md" 
      className="instruction-card" 
      style={{ borderColor: isCustomColor ? color : 'transparent' }}
    >
      <p className="instruction-label">{label}</p>
      <h3 className="instruction-title" style={{ color }}>{title}</h3>
      {subtitle && (
        <p className="instruction-subtitle">{subtitle}</p>
      )}
    </Card>
  )
}