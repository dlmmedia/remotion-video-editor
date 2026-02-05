"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WizardConfig,
  WizardSection,
  CompositionSettings,
  RenderSettings,
  AnimationStyle,
  ContentDirection,
  MediaItem,
} from "@/types/wizard";
import {
  DEFAULT_WIZARD_CONFIG,
  FPS_OPTIONS,
  RESOLUTION_PRESETS,
  CODEC_OPTIONS,
  PIXEL_FORMAT_OPTIONS,
  IMAGE_FORMAT_OPTIONS,
  ANIMATION_TECHNIQUE_OPTIONS,
  PACING_OPTIONS,
  TRANSITION_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  COLOR_PALETTE_PRESETS,
  TONE_OPTIONS,
  CATEGORY_OPTIONS,
  MAX_IMAGES,
  MAX_VIDEOS,
} from "@/types/wizard";
import { assemblePrompt } from "@/helpers/prompt-assembler";

function pick<T>(arr: readonly { value: string }[]): string {
  return arr[Math.floor(Math.random() * arr.length)].value;
}

function pickFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

// ─── Randomizers ────────────────────────────────────────────────────────────

function randomizeComposition(): CompositionSettings {
  const preset = pickFrom(RESOLUTION_PRESETS);
  const fps = pickFrom(FPS_OPTIONS);
  const durationSecs = pickFrom([2, 3, 4, 5, 6, 8, 10]);
  return {
    width: preset.width,
    height: preset.height,
    fps,
    durationInFrames: Math.round(durationSecs * fps),
    backgroundColor: randomHexColor(),
  };
}

function randomizeRender(): RenderSettings {
  const codec = pick(CODEC_OPTIONS) as RenderSettings["codec"];
  return {
    codec,
    pixelFormat: pick(PIXEL_FORMAT_OPTIONS) as RenderSettings["pixelFormat"],
    imageFormat: pick(IMAGE_FORMAT_OPTIONS) as RenderSettings["imageFormat"],
    jpegQuality: randInt(60, 100),
    ...(codec === "prores" ? { proresProfile: "hq" as const } : {}),
  };
}

function randomizeStyle(): AnimationStyle {
  const palette = pickFrom(COLOR_PALETTE_PRESETS);
  return {
    technique: pick(
      ANIMATION_TECHNIQUE_OPTIONS,
    ) as AnimationStyle["technique"],
    pacing: pick(PACING_OPTIONS) as AnimationStyle["pacing"],
    colorPalette: [...palette.colors],
    fontFamily: pick(FONT_FAMILY_OPTIONS),
    fontWeight: pick(FONT_WEIGHT_OPTIONS),
    transition: pick(TRANSITION_OPTIONS) as AnimationStyle["transition"],
  };
}

function randomizeContent(): ContentDirection {
  return {
    sceneDescription: "",
    tone: pick(TONE_OPTIONS) as ContentDirection["tone"],
    category: pick(CATEGORY_OPTIONS) as ContentDirection["category"],
    textContent: "",
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

interface AutofillState {
  loading: boolean;
  section: WizardSection | null;
}

export function useWizardState() {
  const [config, setConfig] = useState<WizardConfig>(DEFAULT_WIZARD_CONFIG);
  const [autofill, setAutofill] = useState<AutofillState>({
    loading: false,
    section: null,
  });

  // ── Section updaters ──────────────────────────────────────────────────

  const updateComposition = useCallback(
    (partial: Partial<CompositionSettings>) => {
      setConfig((prev) => ({
        ...prev,
        composition: { ...prev.composition, ...partial },
      }));
    },
    [],
  );

  const updateRender = useCallback((partial: Partial<RenderSettings>) => {
    setConfig((prev) => ({
      ...prev,
      render: { ...prev.render, ...partial },
    }));
  }, []);

  const updateStyle = useCallback((partial: Partial<AnimationStyle>) => {
    setConfig((prev) => ({
      ...prev,
      style: { ...prev.style, ...partial },
    }));
  }, []);

  const updateContent = useCallback((partial: Partial<ContentDirection>) => {
    setConfig((prev) => ({
      ...prev,
      content: { ...prev.content, ...partial },
    }));
  }, []);

  const setModel = useCallback((modelId: string) => {
    setConfig((prev) => ({ ...prev, modelId }));
  }, []);

  // ── Media management ──────────────────────────────────────────────────

  const addMediaItem = useCallback((item: MediaItem) => {
    setConfig((prev) => {
      const current = prev.media.items;
      const imageCount = current.filter((i) => i.type === "image").length;
      const videoCount = current.filter((i) => i.type === "video").length;

      if (item.type === "image" && imageCount >= MAX_IMAGES) return prev;
      if (item.type === "video" && videoCount >= MAX_VIDEOS) return prev;

      return {
        ...prev,
        media: { items: [...current, item] },
      };
    });
  }, []);

  const removeMediaItem = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      media: { items: prev.media.items.filter((i) => i.id !== id) },
    }));
  }, []);

  const updateMediaItemRole = useCallback(
    (id: string, role: MediaItem["role"]) => {
      setConfig((prev) => ({
        ...prev,
        media: {
          items: prev.media.items.map((i) =>
            i.id === id ? { ...i, role } : i,
          ),
        },
      }));
    },
    [],
  );

  // ── Randomizers ───────────────────────────────────────────────────────

  const randomizeSection = useCallback((section: WizardSection) => {
    setConfig((prev) => {
      switch (section) {
        case "composition":
          return { ...prev, composition: randomizeComposition() };
        case "render":
          return { ...prev, render: randomizeRender() };
        case "style":
          return { ...prev, style: randomizeStyle() };
        case "content":
          return { ...prev, content: randomizeContent() };
        default:
          return prev;
      }
    });
  }, []);

  const randomizeAll = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      composition: randomizeComposition(),
      render: randomizeRender(),
      style: randomizeStyle(),
      content: randomizeContent(),
    }));
  }, []);

  // ── AI Autofill ───────────────────────────────────────────────────────

  const autofillSection = useCallback(
    async (section: WizardSection) => {
      if (!config.content.sceneDescription.trim() && section !== "content") {
        return;
      }

      setAutofill({ loading: true, section });

      try {
        const response = await fetch("/api/wizard/autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: config.content.sceneDescription,
            section,
            currentConfig: config,
          }),
        });

        if (!response.ok) throw new Error("Autofill request failed");

        const data = await response.json();

        setConfig((prev) => {
          switch (section) {
            case "composition":
              return { ...prev, composition: { ...prev.composition, ...data } };
            case "render":
              return { ...prev, render: { ...prev.render, ...data } };
            case "style":
              return { ...prev, style: { ...prev.style, ...data } };
            case "content":
              return { ...prev, content: { ...prev.content, ...data } };
            default:
              return prev;
          }
        });
      } catch (error) {
        console.error("Autofill error:", error);
      } finally {
        setAutofill({ loading: false, section: null });
      }
    },
    [config],
  );

  const autofillAll = useCallback(async () => {
    if (!config.content.sceneDescription.trim()) return;

    setAutofill({ loading: true, section: null });

    try {
      const response = await fetch("/api/wizard/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: config.content.sceneDescription,
          section: "all",
          currentConfig: config,
        }),
      });

      if (!response.ok) throw new Error("Autofill request failed");

      const data = await response.json();

      setConfig((prev) => ({
        ...prev,
        ...(data.composition && {
          composition: { ...prev.composition, ...data.composition },
        }),
        ...(data.render && { render: { ...prev.render, ...data.render } }),
        ...(data.style && { style: { ...prev.style, ...data.style } }),
        ...(data.content && { content: { ...prev.content, ...data.content } }),
      }));
    } catch (error) {
      console.error("Autofill all error:", error);
    } finally {
      setAutofill({ loading: false, section: null });
    }
  }, [config]);

  // ── Assembled prompt ──────────────────────────────────────────────────

  const assembledPrompt = useMemo(() => assemblePrompt(config), [config]);

  // ── Reset ─────────────────────────────────────────────────────────────

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_WIZARD_CONFIG);
  }, []);

  return {
    config,
    setConfig,
    assembledPrompt,
    // Section updaters
    updateComposition,
    updateRender,
    updateStyle,
    updateContent,
    setModel,
    // Media
    addMediaItem,
    removeMediaItem,
    updateMediaItemRole,
    // Randomize
    randomizeSection,
    randomizeAll,
    // Autofill
    autofillSection,
    autofillAll,
    autofillState: autofill,
    // Reset
    resetConfig,
  };
}
