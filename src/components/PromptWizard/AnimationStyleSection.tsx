"use client";

import { Palette, X } from "lucide-react";
import type { AnimationStyle } from "@/types/wizard";
import {
  ANIMATION_TECHNIQUE_OPTIONS,
  PACING_OPTIONS,
  TRANSITION_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  COLOR_PALETTE_PRESETS,
} from "@/types/wizard";
import { SectionHeader } from "./SectionHeader";

interface AnimationStyleSectionProps {
  settings: AnimationStyle;
  onChange: (partial: Partial<AnimationStyle>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onRandomize: () => void;
  onAutofill: () => void;
  isAutofilling: boolean;
}

export function AnimationStyleSection({
  settings,
  onChange,
  isOpen,
  onToggle,
  onRandomize,
  onAutofill,
  isAutofilling,
}: AnimationStyleSectionProps) {
  const addColor = () => {
    if (settings.colorPalette.length < 6) {
      onChange({
        colorPalette: [...settings.colorPalette, "#888888"],
      });
    }
  };

  const removeColor = (index: number) => {
    if (settings.colorPalette.length > 2) {
      onChange({
        colorPalette: settings.colorPalette.filter((_, i) => i !== index),
      });
    }
  };

  const updateColor = (index: number, color: string) => {
    const updated = [...settings.colorPalette];
    updated[index] = color;
    onChange({ colorPalette: updated });
  };

  return (
    <SectionHeader
      title="Animation Style"
      icon={<Palette className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      onRandomize={onRandomize}
      onAutofill={onAutofill}
      isAutofilling={isAutofilling}
    >
      {/* Animation Technique */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Animation Technique
        </label>
        <div className="flex gap-2">
          {ANIMATION_TECHNIQUE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({
                  technique: opt.value as AnimationStyle["technique"],
                })
              }
              className={`flex-1 text-[10px] py-1.5 rounded-md border transition-colors ${
                settings.technique === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pacing */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Pacing
        </label>
        <div className="flex gap-2">
          {PACING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({ pacing: opt.value as AnimationStyle["pacing"] })
              }
              className={`flex-1 text-[10px] py-1.5 rounded-md border transition-colors ${
                settings.pacing === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transition Style */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Transition Style
        </label>
        <div className="flex gap-2">
          {TRANSITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({
                  transition: opt.value as AnimationStyle["transition"],
                })
              }
              className={`flex-1 text-[10px] py-1.5 rounded-md border transition-colors ${
                settings.transition === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Color Palette
        </label>
        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COLOR_PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange({ colorPalette: [...preset.colors] })}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md border border-border/50 hover:border-violet-glow/20 transition-colors group"
              title={preset.name}
            >
              {preset.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span className="text-[9px] text-muted-foreground-dim group-hover:text-muted-foreground ml-0.5">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom colors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {settings.colorPalette.map((color, index) => (
            <div key={index} className="relative group">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="w-8 h-8 rounded-md border border-border cursor-pointer bg-transparent"
              />
              {settings.colorPalette.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </div>
          ))}
          {settings.colorPalette.length < 6 && (
            <button
              type="button"
              onClick={addColor}
              className="w-8 h-8 rounded-md border border-dashed border-border/50 text-muted-foreground hover:border-violet-glow/30 hover:text-foreground flex items-center justify-center text-sm transition-colors"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Typography */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Font Family
          </label>
          <select
            value={settings.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          >
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Font Weight
          </label>
          <select
            value={settings.fontWeight}
            onChange={(e) => onChange({ fontWeight: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          >
            {FONT_WEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SectionHeader>
  );
}
