import { Input } from "@/components/ui/Input";
import { SelectableTile } from "@/components/ui/SelectableTile";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { 
  Leaf, 
  TrendingUp, 
  Flame, 
  Trophy, 
  CircleDot, 
  HeartPulse, 
  Crosshair, 
  Zap, 
  Sparkles, 
  Circle, 
  Cone, 
  Shirt, 
  Dumbbell 
} from "lucide-react";

import imgWinger from "../../../assets/1.webp";
import imgStriker from "../../../assets/2.webp";
import imgMidfielder from "../../../assets/3.webp";
import imgDefender from "../../../assets/4.webp";
import imgGoalkeeper from "../../../assets/5.webp";

import "./OnboardingSteps.css";

const renderIcon = (content: React.ReactNode) => (
  <div style={{
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'var(--color-bg-subtle, #f4f4f5)',
    border: '1px solid var(--color-border, #e5e5e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-primary, #191919)',
    flexShrink: 0,
    overflow: 'hidden'
  }}>
    {content}
  </div>
);

const renderImage = (src: string, alt: string) => (
  renderIcon(
    <img 
      src={src} 
      alt={alt} 
      style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
      loading="lazy"
    />
  )
);

/* ── Step 1: Name ── */
interface StepNameProps {
  value: string;
  onChange: (v: string) => void;
  onLoginInstead: () => void;
}

export function StepName({ value, onChange, onLoginInstead }: StepNameProps) {
  return (
    <div className="onboarding-step-name pb-32">
      <Input
        label="Your name"
        placeholder="e.g. Khalid"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      <button type="button" className="onboarding-step-name__login" onClick={onLoginInstead}>
        Already have an account? <span>Log in</span>
      </button>
    </div>
  );
}

/* ── Step 2: Age ── */
const AGES = Array.from({ length: 37 }, (_, i) => String(i + 13));

export function StepAge({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="onboarding-step-age scrollbar-hide pb-32">
      {AGES.map((a, i) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={`onboarding-step-age__chip anim-up d${Math.min(i % 8, 8)} ${
            value === a ? "onboarding-step-age__chip--active" : ""
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

/* ── Step 3: Position ── */
const POSITIONS = [
  {
    id: "Goalkeeper",
    label: "Goalkeeper",
    desc: "Shot-stopping, positioning & distribution",
    icon: renderImage(imgGoalkeeper, "Goalkeeper")
  },
  {
    id: "Defender",
    label: "Defender",
    desc: "Tackling, marking & building from the back",
    icon: renderImage(imgDefender, "Defender")
  },
  {
    id: "Midfielder",
    label: "Midfielder",
    desc: "Passing, pressing & controlling the game",
    icon: renderImage(imgMidfielder, "Midfielder")
  },
  {
    id: "Winger",
    label: "Winger",
    desc: "Dribbling, crossing & beating defenders",
    icon: renderImage(imgWinger, "Winger")
  },
  {
    id: "Striker",
    label: "Striker",
    desc: "Finishing, movement & creating chances",
    icon: renderImage(imgStriker, "Striker")
  },
];

export function StepPosition({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="onboarding-step-list scrollbar-hide pb-32">
      {POSITIONS.map((p, i) => (
        <div key={p.id} className={`anim-up d${i}`}>
          <SelectableTile
            label={p.label}
            sublabel={p.desc}
            icon={p.icon}
            selected={value === p.id}
            onSelect={() => onChange(p.id)}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Step 4: Experience ── */
const EXPERIENCE = [
  { id: "0-6mo", label: "Less than 6 months", desc: "Just getting started", icon: renderIcon(<Leaf size={20} strokeWidth={1.8} />) },
  { id: "6mo-2yr", label: "6 months – 2 years", desc: "Learning the basics", icon: renderIcon(<TrendingUp size={20} strokeWidth={1.8} />) },
  { id: "2-5yr", label: "2 – 5 years", desc: "Comfortable with the game", icon: renderIcon(<Flame size={20} strokeWidth={1.8} />) },
  { id: "5yr+", label: "More than 5 years", desc: "Experienced player", icon: renderIcon(<Trophy size={20} strokeWidth={1.8} />) },
];

export function StepExperience({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="onboarding-step-list scrollbar-hide pb-32">
      {EXPERIENCE.map((e, i) => (
        <div key={e.id} className={`anim-up d${i}`}>
          <SelectableTile
            label={e.label}
            sublabel={e.desc}
            icon={e.icon}
            selected={value === e.id}
            onSelect={() => onChange(e.id)}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Step 5: Goal ── */
const GOALS = [
  { id: "dribbling", label: "Dribbling & ball control", icon: renderIcon(<CircleDot size={20} strokeWidth={1.8} />) },
  { id: "stamina", label: "Build stamina & fitness", icon: renderIcon(<HeartPulse size={20} strokeWidth={1.8} />) },
  { id: "shooting", label: "Sniper finishing", icon: renderIcon(<Crosshair size={20} strokeWidth={1.8} />) },
  { id: "speed", label: "Speed & acceleration", icon: renderIcon(<Zap size={20} strokeWidth={1.8} />) },
  { id: "complete", label: "Become a complete player", icon: renderIcon(<Sparkles size={20} strokeWidth={1.8} />) },
];

export function StepGoal({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="onboarding-step-list scrollbar-hide pb-32">
      {GOALS.map((g, i) => (
        <div key={g.id} className={`anim-up d${i}`}>
          <SelectableTile
            label={g.label}
            icon={g.icon}
            selected={value === g.id}
            onSelect={() => onChange(g.id)}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Step 6: Equipment ── */
const EQUIPMENT = [
  { id: "ball", label: "Just a ball", desc: "Solo close-control drills", icon: renderIcon(<Circle size={20} strokeWidth={1.8} />) },
  { id: "cones", label: "Ball + cones", desc: "Full technical drills", icon: renderIcon(<Cone size={20} strokeWidth={1.8} />) },
  { id: "kit", label: "Full training kit", desc: "Game scenarios + technical", icon: renderIcon(<Shirt size={20} strokeWidth={1.8} />) },
  { id: "gym", label: "Kit + gym access", desc: "Athletic & technical training", icon: renderIcon(<Dumbbell size={20} strokeWidth={1.8} />) },
];

export function StepEquipment({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="onboarding-step-list scrollbar-hide pb-32">
      {EQUIPMENT.map((e, i) => (
        <div key={e.id} className={`anim-up d${i}`}>
          <SelectableTile
            label={e.label}
            sublabel={e.desc}
            icon={e.icon}
            selected={value === e.id}
            onSelect={() => onChange(e.id)}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Step 7: Frequency + Weak foot ── */
const FREQUENCY = [
  { id: "1-2", label: "1–2 times a week", desc: "Casual training" },
  { id: "3-4", label: "3–4 times a week", desc: "Dedicated training" },
  { id: "5+", label: "5–7 times a week", desc: "Intensive training" },
];

const WEAK_FOOT_OPTIONS = [
  { value: "left", label: "Left foot" },
  { value: "right", label: "Right foot" },
  { value: "both", label: "Both equal" },
];

interface StepFrequencyProps {
  value: string;
  weakFoot: string;
  onChange: (v: string) => void;
  onWeakFoot: (v: string) => void;
}

export function StepFrequency({ value, weakFoot, onChange, onWeakFoot }: StepFrequencyProps) {
  return (
    <div className="onboarding-step-frequency scrollbar-hide pb-40" style={{ paddingBottom: '150px' }}>
      <p className="onboarding-step-frequency__label">Sessions per week</p>
      <div className="onboarding-step-list onboarding-step-frequency__list">
        {FREQUENCY.map((f, i) => (
          <div key={f.id} className={`anim-up d${i}`}>
            <SelectableTile
              label={f.label}
              sublabel={f.desc}
              selected={value === f.id}
              onSelect={() => onChange(f.id)}
            />
          </div>
        ))}
      </div>

      <p className="onboarding-step-frequency__label" style={{ marginTop: '24px' }}>Weaker foot</p>
      <SegmentedControl options={WEAK_FOOT_OPTIONS} value={weakFoot} onChange={onWeakFoot} />
    </div>
  );
}