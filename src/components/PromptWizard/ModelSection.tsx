"use client";

import { Cpu } from "lucide-react";
import { MODELS } from "@/types/generation";
import { SectionHeader } from "./SectionHeader";

interface ModelSectionProps {
  modelId: string;
  onChange: (modelId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ModelSection({
  modelId,
  onChange,
  isOpen,
  onToggle,
}: ModelSectionProps) {
  return (
    <SectionHeader
      title="AI Model"
      icon={<Cpu className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Model & Reasoning Effort
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`text-xs px-3 py-2 rounded-md border text-left transition-colors ${
                modelId === m.id
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </SectionHeader>
  );
}
