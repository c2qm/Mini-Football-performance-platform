import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { StepDots } from "@/components/ui/StepDots";
import { Button } from "@/components/ui/Button";

interface SetupLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: ReactNode;
}

export function SetupLayout({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  children,
}: SetupLayoutProps) {
  return (
    <div 
      className="scrollbar-hide"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100dvh', 
        backgroundColor: 'var(--bg)', 
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 20px',
          flexShrink: 0 
        }}
      >
        {onBack ? (
          <IconButton onClick={onBack} aria-label="Go back">
            <ChevronLeft size={20} />
          </IconButton>
        ) : (
          <span style={{ width: 40 }} />
        )}
        <StepDots total={totalSteps} current={step} />
        <span style={{ width: 40 }} />
      </div>

      {/* Body / Content */}
      <div 
        style={{ 
          flex: 1, 
          padding: '0 20px 40px 20px',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
        <div style={{ flex: 1, marginBottom: '24px' }}>
          {children}
        </div>
      </div>

      {/* Sticky Footer Button */}
      <div 
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg)',
          padding: '16px 20px calc(20px + env(safe-area-inset-bottom)) 20px',
          zIndex: 50,
          boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <Button fullWidth size="lg" onClick={onNext} disabled={nextDisabled}>
            {nextLabel ?? "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}