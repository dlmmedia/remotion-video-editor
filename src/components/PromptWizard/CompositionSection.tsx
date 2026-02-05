"use client";

import { Monitor } from "lucide-react";
import type { CompositionSettings } from "@/types/wizard";
import { RESOLUTION_PRESETS, FPS_OPTIONS } from "@/types/wizard";
import { SectionHeader } from "./SectionHeader";

interface CompositionSectionProps {
  settings: CompositionSettings;
  onChange: (partial: Partial<CompositionSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onRandomize: () => void;
  onAutofill: () => void;
  isAutofilling: boolean;
}

export function CompositionSection({
  settings,
  onChange,
  isOpen,
  onToggle,
  onRandomize,
  onAutofill,
  isAutofilling,
}: CompositionSectionProps) {
  const seconds = (settings.durationInFrames / settings.fps).toFixed(2);

  return (
    <SectionHeader
      title="Composition"
      icon={<Monitor className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      onRandomize={onRandomize}
      onAutofill={onAutofill}
      isAutofilling={isAutofilling}
    >
      {/* Resolution presets */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Resolution Preset
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RESOLUTION_PRESETS.map((preset) => {
            const isActive =
              settings.width === preset.width &&
              settings.height === preset.height;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange({ width: preset.width, height: preset.height })
                }
                className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                  isActive
                    ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                    : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Width (px)
          </label>
          <input
            type="number"
            min={100}
            max={7680}
            value={settings.width}
            onChange={(e) => onChange({ width: parseInt(e.target.value) || 1920 })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Height (px)
          </label>
          <input
            type="number"
            min={100}
            max={4320}
            value={settings.height}
            onChange={(e) =>
              onChange({ height: parseInt(e.target.value) || 1080 })
            }
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          />
        </div>
      </div>

      {/* FPS */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Frames Per Second
        </label>
        <div className="flex gap-2">
          {FPS_OPTIONS.map((fps) => (
            <button
              key={fps}
              type="button"
              onClick={() => onChange({ fps })}
              className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                settings.fps === fps
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {fps}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Duration (frames)
        </label>
        <input
          type="number"
          min={1}
          max={9000}
          value={settings.durationInFrames}
          onChange={(e) =>
            onChange({
              durationInFrames: parseInt(e.target.value) || 150,
            })
          }
          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
        />
        <p className="text-[10px] text-muted-foreground-dim mt-1">
          {seconds}s at {settings.fps} FPS
        </p>
      </div>

      {/* Background Color */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Background Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={settings.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="flex-1 px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs font-mono focus:outline-none focus:border-violet-glow/40"
          />
        </div>
      </div>
    </SectionHeader>
  );
}
