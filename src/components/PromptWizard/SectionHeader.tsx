"use client";

import {
  ChevronDown,
  ChevronRight,
  Dice5,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onRandomize?: () => void;
  onAutofill?: () => void;
  isAutofilling?: boolean;
  children: React.ReactNode;
}

export function SectionHeader({
  title,
  icon,
  isOpen,
  onToggle,
  onRandomize,
  onAutofill,
  isAutofilling = false,
  children,
}: SectionHeaderProps) {
  return (
    <div className="border border-violet-glow/10 rounded-xl overflow-hidden transition-all">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-accent/20 hover:bg-accent/30 transition-colors"
      >
        <span className="text-violet-glow/70">{icon}</span>
        <span className="text-sm font-medium text-foreground flex-1 text-left">
          {title}
        </span>

        {/* Section action buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onRandomize && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onRandomize();
              }}
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              title="Randomize this section"
            >
              <Dice5 className="w-3.5 h-3.5" />
            </Button>
          )}
          {onAutofill && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onAutofill();
              }}
              disabled={isAutofilling}
              className="text-muted-foreground hover:text-violet-glow h-7 w-7"
              title="AI Autofill this section"
            >
              {isAutofilling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>

        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 py-4 space-y-4 bg-background/50">{children}</div>
      )}
    </div>
  );
}
