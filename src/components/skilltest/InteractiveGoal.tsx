import React from 'react'
import './InteractiveGoal.css'

interface InteractiveGoalProps {
  targetX?: number
  targetY?: number
  resultX?: number
  resultY?: number
  onInteract?: (x: number, y: number) => void
  isMissed?: boolean
  targetColor?: string
  showTarget?: boolean
  isPulse?: boolean
  isDisabled?: boolean
}

export function InteractiveGoal({
  targetX, 
  targetY, 
  resultX, 
  resultY,
  onInteract, 
  isMissed, 
  targetColor = '#ffc107',
  showTarget = true, 
  isPulse = false, 
  isDisabled = false
}: InteractiveGoalProps) {

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled || !onInteract) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onInteract(x, y)
  }

  const targetBgColor = targetColor.startsWith('var') 
    ? 'rgba(255,255,255,0.4)' 
    : `${targetColor}66`

  return (
    <div className={`goal-container ${isDisabled ? 'disabled' : ''}`} onClick={handleClick}>
      <div className="goal-frame">
        <div className="goal-net" />
      </div>
      
      {showTarget && targetX !== undefined && targetY !== undefined && (
        <div 
          className={`target-marker ${isPulse ? 'pulse' : ''}`} 
          style={{ 
            left: `${targetX}%`, 
            top: `${targetY}%`, 
            background: targetBgColor, 
            border: `2px dashed ${targetColor}` 
          }} 
        />
      )}
      
      {resultX !== undefined && resultY !== undefined && (
        <div 
          className="result-marker" 
          style={{ 
            left: `${resultX}%`, 
            top: `${resultY}%`, 
            background: isMissed ? '#ef4444' : 'var(--color-accent)' 
          }} 
        />
      )}
    </div>
  )
}