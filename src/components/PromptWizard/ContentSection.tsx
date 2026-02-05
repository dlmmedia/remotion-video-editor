"use client";

import { FileText } from "lucide-react";
import type { ContentDirection } from "@/types/wizard";
import { TONE_OPTIONS, CATEGORY_OPTIONS } from "@/types/wizard";
import { SectionHeader } from "./SectionHeader";

interface ContentSectionProps {
  settings: ContentDirection;
  onChange: (partial: Partial<ContentDirection>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onRandomize: () => void;
  onAutofill: () => void;
  isAutofilling: boolean;
}

export function ContentSection({
  settings,
  onChange,
  isOpen,
  onToggle,
  onRandomize,
  onAutofill,
  isAutofilling,
}: ContentSectionProps) {
  return (
    <SectionHeader
      title="Content Direction"
      icon={<FileText className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      onRandomize={onRandomize}
      onAutofill={onAutofill}
      isAutofilling={isAutofilling}
    >
      {/* Scene Description (main prompt) */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Scene Description
        </label>
        <textarea
          value={settings.sceneDescription}
          onChange={(e) => onChange({ sceneDescription: e.target.value })}
          placeholder="Describe the animation you want to create..."
          className="w-full px-2.5 py-2 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40 resize-none min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Tone */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Tone
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({ tone: opt.value as ContentDirection["tone"] })
              }
              className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                settings.tone === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({
                  category: opt.value as ContentDirection["category"],
                })
              }
              className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                settings.category === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Text Content (to display in the animation)
        </label>
        <textarea
          value={settings.textContent}
          onChange={(e) => onChange({ textContent: e.target.value })}
          placeholder="Headlines, body text, labels..."
          className="w-full px-2.5 py-2 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40 resize-none min-h-[60px]"
          rows={2}
        />
      </div>
    </SectionHeader>
  );
}
