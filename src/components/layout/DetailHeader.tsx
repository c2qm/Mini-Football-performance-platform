import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import "./DetailHeader.css";

interface DetailHeaderProps {
  title: string;
  action?: ReactNode;
  onBack?: () => void;
}

export function DetailHeader({ title, action, onBack }: DetailHeaderProps) {
  return (
    <div className="detail-header">
      {onBack && (
        <IconButton aria-label="Go back" onClick={onBack}>
          <ChevronLeft size={19} strokeWidth={2} />
        </IconButton>
      )}
      <h1 className="detail-header__title">{title}</h1>
      <div className="detail-header__action">{action}</div>
    </div>
  );
}
