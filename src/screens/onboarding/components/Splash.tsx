import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import "./Splash.css";

export function Splash({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="onboarding-splash anim-fade">
      <div className="onboarding-splash__icon anim-up d0">
        <User size={48} color="var(--color-accent)" />
      </div>

      <h1 className="onboarding-splash__title anim-up d1">
        Welcome. I'm your personal coach.
      </h1>
      <p className="onboarding-splash__subtitle anim-up d2">
        Let's get to know you so I can build a training plan made just for you.
      </p>

      <div className="onboarding-splash__cta anim-up d3">
        <Button fullWidth size="lg" onClick={onContinue}>
          Let's get started
        </Button>
      </div>
    </div>
  );
}