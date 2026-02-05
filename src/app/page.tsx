"use client";

import { useState, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
  Film,
  Wand2,
  Code2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProjectsSidebar } from "@/components/ProjectsSidebar";
import { PromptWizard } from "@/components/PromptWizard";
import type { ModelId } from "@/types/generation";
import { MODELS } from "@/types/generation";
import { fileToBase64 } from "@/helpers/capture-frame";
import { examplePrompts } from "@/examples/prompts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, LucideIcon> = {
  Type,
  MessageCircle,
  Hash,
  BarChart3,
  Disc,
};

const MAX_ATTACHED_IMAGES = 4;

type StudioMode = "simple" | "wizard";

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [studioMode, setStudioMode] = useState<StudioMode>("simple");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-5.2:low");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const handleNavigate = (promptText: string, modelId: ModelId, images?: string[]) => {
    setIsNavigating(true);
    if (images && images.length > 0) {
      sessionStorage.setItem("initialAttachedImages", JSON.stringify(images));
    } else {
      sessionStorage.removeItem("initialAttachedImages");
    }
    const params = new URLSearchParams({ prompt: promptText, model: modelId });
    router.push(`/generate?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isNavigating) return;
    handleNavigate(prompt, model, attachedImages.length > 0 ? attachedImages : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addImages = (newImages: string[]) => {
    setAttachedImages((prev) => [...prev, ...newImages].slice(0, MAX_ATTACHED_IMAGES));
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
    e.target.value = "";
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const files = imageItems
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      const base64Images = await Promise.all(files.map(fileToBase64));
      addImages(base64Images);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
  };

  const handleGetStarted = () => {
    setShowStudio(true);
    setTimeout(() => promptRef.current?.focus(), 300);
  };

  // Hero mode
  if (!showStudio) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <Navbar transparent />
        <HeroSection onGetStarted={handleGetStarted} />
      </div>
    );
  }

  // Studio mode
  return (
    <div className="h-screen w-screen bg-[#030014] bg-grid overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Projects Sidebar */}
        <ProjectsSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewProject={() => {
            setPrompt("");
            setAttachedImages([]);
            promptRef.current?.focus();
          }}
        />

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 z-50 p-1.5 rounded-r-lg bg-accent/80 backdrop-blur-sm border border-l-0 border-violet-glow/10 text-muted-foreground hover:text-foreground transition-all"
          style={{ left: sidebarOpen ? "18rem" : 0 }}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        {/* Main content */}
        <main
          className="flex-1 flex flex-col items-center transition-all duration-300 overflow-y-auto"
          style={{ marginLeft: sidebarOpen ? "18rem" : 0 }}
        >
          <div className="w-full max-w-3xl px-6 py-8 space-y-6">
            {/* Studio heading */}
            <div className="text-center space-y-3 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-glow/10 border border-violet-glow/20">
                <Wand2 className="w-3 h-3 text-violet-glow" />
                <span className="text-xs font-medium text-violet-glow/90">
                  AI Studio
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                What will you <span className="bg-gradient-to-r from-violet-glow to-cyan-glow bg-clip-text text-transparent">create</span>?
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Describe your vision. Our agent writes the code, renders the frames.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="inline-flex items-center bg-accent/30 rounded-lg border border-violet-glow/10 p-0.5">
                <button
                  type="button"
                  onClick={() => setStudioMode("simple")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    studioMode === "simple"
                      ? "bg-violet-glow/15 text-violet-glow border border-violet-glow/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <Wand2 className="w-3 h-3" />
                  Quick Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode("wizard")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    studioMode === "wizard"
                      ? "bg-violet-glow/15 text-violet-glow border border-violet-glow/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Prompt Wizard
                </button>
              </div>
            </div>

            {/* ─── WIZARD MODE ───────────────────────────────────────── */}
            {studioMode === "wizard" ? (
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <PromptWizard
                  onGenerate={(assembledPrompt, modelId, images) => {
                    handleNavigate(assembledPrompt, modelId, images);
                  }}
                  isGenerating={isNavigating}
                />
              </div>
            ) : (
              <>
                {/* ─── SIMPLE MODE (original) ──────────────────────────── */}
                {/* Prompt input */}
                <form
                  onSubmit={handleSubmit}
                  className="animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div
                    className={`relative bg-[#0c0a1d]/80 backdrop-blur-sm rounded-2xl border p-4 transition-all ${
                      isDragging
                        ? "border-violet-glow/50 bg-violet-glow/5 shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                        : "border-violet-glow/15 hover:border-violet-glow/25"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-glow/10 via-transparent to-cyan-glow/10 rounded-2xl pointer-events-none" />

                    {/* Image previews */}
                    {attachedImages.length > 0 && (
                      <div className="relative z-10 mb-3 flex gap-2 overflow-x-auto pb-1 pt-1">
                        {attachedImages.map((img, index) => (
                          <div key={index} className="relative flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`Attached ${index + 1}`}
                              className="h-16 w-auto rounded-lg border border-violet-glow/20 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      ref={promptRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder={
                        isDragging
                          ? "Drop images here..."
                          : "A cinematic product launch with particles..."
                      }
                      className="relative z-10 w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none overflow-y-auto text-base min-h-[60px] max-h-[200px]"
                      style={{ fieldSizing: "content" } as React.CSSProperties}
                      disabled={isNavigating}
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="relative z-10 flex justify-between items-center mt-3 pt-3 border-t border-violet-glow/10">
                      <Select
                        value={model}
                        onValueChange={(value) => setModel(value as ModelId)}
                        disabled={isNavigating}
                      >
                        <SelectTrigger className="w-auto bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0a1d] border-violet-glow/20">
                          {MODELS.map((m) => (
                            <SelectItem
                              key={m.id}
                              value={m.id}
                              className="text-foreground focus:bg-violet-glow/10 focus:text-foreground text-xs"
                            >
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isNavigating || attachedImages.length >= MAX_ATTACHED_IMAGES}
                          className="text-muted-foreground hover:text-foreground hover:bg-violet-glow/10"
                          title="Attach images"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>

                        <button
                          type="submit"
                          disabled={!prompt.trim() || isNavigating}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-violet-glow to-cyan-glow text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
                        >
                          {isNavigating ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <ArrowUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Example prompts */}
                <div
                  className="flex flex-wrap items-center justify-center gap-2 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  <span className="text-muted-foreground-dim text-[11px] mr-1">
                    Try
                  </span>
                  {examplePrompts.map((example) => {
                    const Icon = iconMap[example.icon];
                    return (
                      <button
                        key={example.id}
                        type="button"
                        onClick={() => setPrompt(example.prompt)}
                        className="group rounded-full bg-accent/40 border border-violet-glow/10 hover:border-violet-glow/25 hover:bg-accent/60 transition-all flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Icon className="w-3 h-3 text-violet-glow/60 group-hover:text-violet-glow" />
                        {example.headline}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Quick actions */}
            <div
              className="flex justify-center gap-6 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <QuickAction
                icon={<Film className="w-4 h-4" />}
                label="Templates"
                sublabel="Pre-built scenes"
              />
              <QuickAction
                icon={<Code2 className="w-4 h-4" />}
                label="Code Examples"
                sublabel="Learn patterns"
                href="/code-examples"
              />
              <QuickAction
                icon={<Sparkles className="w-4 h-4" />}
                label="Showcase"
                sublabel="Community picks"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function QuickAction({
  icon,
  label,
  sublabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  href?: string;
}) {
  const Component = href ? "a" : "button";
  return (
    <Component
      href={href}
      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent/30 transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/50 border border-violet-glow/10 flex items-center justify-center text-muted-foreground group-hover:text-violet-glow group-hover:border-violet-glow/25 transition-all">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground-dim">{sublabel}</div>
      </div>
    </Component>
  );
}

export default Home;
