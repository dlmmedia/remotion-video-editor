"use client";

import { useState } from "react";
import {
  ArrowUp,
  Dice5,
  Sparkles,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardState } from "@/hooks/useWizardState";
import type { ModelId } from "@/types/generation";

import { CompositionSection } from "./CompositionSection";
import { RenderSection } from "./RenderSection";
import { AnimationStyleSection } from "./AnimationStyleSection";
import { ContentSection } from "./ContentSection";
import { ReferenceMediaSection } from "./ReferenceMediaSection";
import { ModelSection } from "./ModelSection";

interface PromptWizardProps {
  onGenerate: (prompt: string, modelId: ModelId, images?: string[]) => void;
  isGenerating?: boolean;
}

type SectionKey =
  | "content"
  | "composition"
  | "style"
  | "render"
  | "media"
  | "model";

export function PromptWizard({
  onGenerate,
  isGenerating = false,
}: PromptWizardProps) {
  const {
    config,
    assembledPrompt,
    updateComposition,
    updateRender,
    updateStyle,
    updateContent,
    setModel,
    addMediaItem,
    removeMediaItem,
    updateMediaItemRole,
    randomizeSection,
    randomizeAll,
    autofillSection,
    autofillAll,
    autofillState,
    resetConfig,
  } = useWizardState();

  // Track which sections are open - content is open by default
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      content: true,
      composition: false,
      style: false,
      render: false,
      media: false,
      model: false,
    },
  );

  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      content: true,
      composition: true,
      style: true,
      render: true,
      media: true,
      model: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      content: false,
      composition: false,
      style: false,
      render: false,
      media: false,
      model: false,
    });
  };

  const handleSubmit = () => {
    if (!config.content.sceneDescription.trim()) return;

    // Collect image base64s for the API
    const images = config.media.items
      .filter((item) => item.type === "image")
      .map((item) => item.src);

    onGenerate(
      assembledPrompt,
      config.modelId as ModelId,
      images.length > 0 ? images : undefined,
    );
  };

  const hasPrompt = config.content.sceneDescription.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Top toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="text-[10px] text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <ChevronDown className="w-3 h-3 mr-1" />
            Expand All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="text-[10px] text-muted-foreground hover:text-foreground h-7 px-2"
          >
            <ChevronUp className="w-3 h-3 mr-1" />
            Collapse
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={randomizeAll}
            className="text-[10px] text-muted-foreground hover:text-foreground h-7 px-2"
            title="Randomize all sections"
          >
            <Dice5 className="w-3.5 h-3.5 mr-1" />
            Randomize All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={autofillAll}
            disabled={!hasPrompt || autofillState.loading}
            className="text-[10px] text-muted-foreground hover:text-violet-glow h-7 px-2"
            title="AI Autofill all sections based on your scene description"
          >
            {autofillState.loading && !autofillState.section ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            Autofill All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetConfig}
            className="text-[10px] text-muted-foreground hover:text-foreground h-7 px-2"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {/* Section 1: Content Direction (opened by default - has the main prompt) */}
        <ContentSection
          settings={config.content}
          onChange={updateContent}
          isOpen={openSections.content}
          onToggle={() => toggleSection("content")}
          onRandomize={() => randomizeSection("content")}
          onAutofill={() => autofillSection("content")}
          isAutofilling={
            autofillState.loading && autofillState.section === "content"
          }
        />

        {/* Section 2: Composition */}
        <CompositionSection
          settings={config.composition}
          onChange={updateComposition}
          isOpen={openSections.composition}
          onToggle={() => toggleSection("composition")}
          onRandomize={() => randomizeSection("composition")}
          onAutofill={() => autofillSection("composition")}
          isAutofilling={
            autofillState.loading && autofillState.section === "composition"
          }
        />

        {/* Section 3: Animation Style */}
        <AnimationStyleSection
          settings={config.style}
          onChange={updateStyle}
          isOpen={openSections.style}
          onToggle={() => toggleSection("style")}
          onRandomize={() => randomizeSection("style")}
          onAutofill={() => autofillSection("style")}
          isAutofilling={
            autofillState.loading && autofillState.section === "style"
          }
        />

        {/* Section 4: Render & Export */}
        <RenderSection
          settings={config.render}
          onChange={updateRender}
          isOpen={openSections.render}
          onToggle={() => toggleSection("render")}
          onRandomize={() => randomizeSection("render")}
          onAutofill={() => autofillSection("render")}
          isAutofilling={
            autofillState.loading && autofillState.section === "render"
          }
        />

        {/* Section 5: Reference Media */}
        <ReferenceMediaSection
          items={config.media.items}
          onAddItem={addMediaItem}
          onRemoveItem={removeMediaItem}
          onUpdateRole={updateMediaItemRole}
          isOpen={openSections.media}
          onToggle={() => toggleSection("media")}
        />

        {/* Section 6: AI Model */}
        <ModelSection
          modelId={config.modelId}
          onChange={setModel}
          isOpen={openSections.model}
          onToggle={() => toggleSection("model")}
        />
      </div>

      {/* Prompt Preview */}
      <div className="border border-border/30 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="w-full flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 transition-colors text-xs text-muted-foreground"
        >
          <span className="flex-1 text-left">Assembled Prompt Preview</span>
          {showPromptPreview ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        {showPromptPreview && (
          <pre className="px-4 py-3 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap max-h-48 overflow-auto bg-background/50">
            {assembledPrompt || "(Enter a scene description to see the assembled prompt)"}
          </pre>
        )}
      </div>

      {/* Generate button */}
      <div className="flex justify-center pt-2 pb-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasPrompt || isGenerating}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-glow to-cyan-glow text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ArrowUp className="w-4 h-4" />
              Generate Video
            </>
          )}
        </button>
      </div>
    </div>
  );
}
