"use client";

import { Film } from "lucide-react";
import type { RenderSettings } from "@/types/wizard";
import {
  CODEC_OPTIONS,
  PIXEL_FORMAT_OPTIONS,
  IMAGE_FORMAT_OPTIONS,
  PRORES_PROFILE_OPTIONS,
} from "@/types/wizard";
import { SectionHeader } from "./SectionHeader";

interface RenderSectionProps {
  settings: RenderSettings;
  onChange: (partial: Partial<RenderSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onRandomize: () => void;
  onAutofill: () => void;
  isAutofilling: boolean;
}

export function RenderSection({
  settings,
  onChange,
  isOpen,
  onToggle,
  onRandomize,
  onAutofill,
  isAutofilling,
}: RenderSectionProps) {
  const crfMax =
    settings.codec === "vp8"
      ? 63
      : settings.codec === "vp9"
        ? 63
        : 51;
  const crfDefault =
    settings.codec === "vp8"
      ? 9
      : settings.codec === "vp9"
        ? 28
        : 23;

  return (
    <SectionHeader
      title="Render & Export"
      icon={<Film className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
      onRandomize={onRandomize}
      onAutofill={onAutofill}
      isAutofilling={isAutofilling}
    >
      {/* Codec */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Codec
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CODEC_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ codec: opt.value as RenderSettings["codec"] })}
              className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                settings.codec === opt.value
                  ? "border-violet-glow/40 bg-violet-glow/10 text-violet-glow"
                  : "border-border/50 text-muted-foreground hover:border-violet-glow/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CRF & Video Bitrate (mutually exclusive) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            CRF (Quality: 0=best, {crfMax}=worst)
          </label>
          <input
            type="range"
            min={0}
            max={crfMax}
            value={settings.crf ?? crfDefault}
            onChange={(e) =>
              onChange({
                crf: parseInt(e.target.value),
                videoBitrate: undefined,
              })
            }
            disabled={!!settings.videoBitrate}
            className="w-full accent-violet-glow"
          />
          <span className="text-[10px] text-muted-foreground-dim">
            {settings.crf ?? crfDefault}
          </span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Video Bitrate (overrides CRF)
          </label>
          <input
            type="text"
            value={settings.videoBitrate ?? ""}
            onChange={(e) =>
              onChange({
                videoBitrate: e.target.value || undefined,
                crf: e.target.value ? undefined : settings.crf,
              })
            }
            placeholder="e.g. 5M"
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          />
        </div>
      </div>

      {/* Audio Bitrate */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Audio Bitrate
        </label>
        <input
          type="text"
          value={settings.audioBitrate ?? ""}
          onChange={(e) =>
            onChange({ audioBitrate: e.target.value || undefined })
          }
          placeholder="e.g. 128k"
          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
        />
      </div>

      {/* Pixel Format & Image Format */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Pixel Format
          </label>
          <select
            value={settings.pixelFormat}
            onChange={(e) =>
              onChange({
                pixelFormat: e.target.value as RenderSettings["pixelFormat"],
              })
            }
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          >
            {PIXEL_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Image Format
          </label>
          <select
            value={settings.imageFormat}
            onChange={(e) =>
              onChange({
                imageFormat: e.target.value as RenderSettings["imageFormat"],
              })
            }
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          >
            {IMAGE_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* JPEG Quality */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          JPEG Quality
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.jpegQuality}
          onChange={(e) =>
            onChange({ jpegQuality: parseInt(e.target.value) })
          }
          className="w-full accent-violet-glow"
        />
        <span className="text-[10px] text-muted-foreground-dim">
          {settings.jpegQuality}%
        </span>
      </div>

      {/* ProRes Profile (only when prores codec selected) */}
      {settings.codec === "prores" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            ProRes Profile
          </label>
          <select
            value={settings.proresProfile ?? "standard"}
            onChange={(e) =>
              onChange({
                proresProfile: e.target
                  .value as RenderSettings["proresProfile"],
              })
            }
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-input text-foreground text-xs focus:outline-none focus:border-violet-glow/40"
          >
            {PRORES_PROFILE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </SectionHeader>
  );
}
