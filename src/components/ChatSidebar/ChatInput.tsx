"use client";

import { useState, useRef, type ComponentType, type DragEvent, type ChangeEvent } from "react";
import { ArrowUp, Camera, X, Paperclip, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ModelId, MODELS } from "@/types/generation";
import { captureFrame, fileToBase64 } from "@/helpers/capture-frame";

const MAX_ATTACHED_IMAGES = 4;
const MAX_ATTACHED_VIDEOS = 2;

interface AttachedMedia {
  type: "image" | "video";
  /** base64 data URL for images, thumbnail for videos */
  src: string;
  /** Original filename */
  fileName?: string;
  /** Server upload path (for videos) */
  uploadPath?: string;
  /** Duration in seconds (for videos) */
  duration?: number;
}

interface ChatInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  isLoading: boolean;
  onSubmit: (attachedImages?: string[]) => void;
  // Frame capture props
  Component?: ComponentType | null;
  fps?: number;
  durationInFrames?: number;
  currentFrame?: number;
}

async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = "metadata";

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 4);
    };

    video.onseeked = () => {
      canvas.width = Math.min(video.videoWidth, 480);
      canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.6);
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video"));
    };
  });
}

export function ChatInput({
  prompt,
  onPromptChange,
  model,
  onModelChange,
  isLoading,
  onSubmit,
  Component,
  fps = 30,
  durationInFrames = 150,
  currentFrame = 0,
}: ChatInputProps) {
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageCount = attachedMedia.filter((m) => m.type === "image").length;
  const videoCount = attachedMedia.filter((m) => m.type === "video").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Collect image base64s (including video thumbnails with context)
    const images = attachedMedia
      .filter((m) => m.type === "image")
      .map((m) => m.src);

    // For videos, include their thumbnails as images for AI context
    const videoThumbnails = attachedMedia
      .filter((m) => m.type === "video" && m.src)
      .map((m) => m.src);

    const allImages = [...images, ...videoThumbnails];

    // If videos are attached, augment the prompt with video context
    const videoMedia = attachedMedia.filter((m) => m.type === "video");
    let augmentedPrompt = prompt;
    if (videoMedia.length > 0) {
      const videoContext = videoMedia
        .map((v) => {
          let info = `Video file: "${v.fileName}"`;
          if (v.duration) info += ` (${v.duration.toFixed(1)}s)`;
          if (v.uploadPath) info += ` - use staticFile("${v.uploadPath}")`;
          return info;
        })
        .join("\n");
      augmentedPrompt = `${prompt}\n\nAttached videos:\n${videoContext}`;
    }

    onPromptChange(augmentedPrompt);
    onSubmit(allImages.length > 0 ? allImages : undefined);
    setAttachedMedia([]);
  };

  const addMedia = (newMedia: AttachedMedia[]) => {
    setAttachedMedia((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setAttachedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const videoFiles = files.filter((f) => f.type.startsWith("video/"));

    // Process images (base64)
    if (imageFiles.length > 0) {
      const base64Images = await Promise.all(imageFiles.map(fileToBase64));
      const mediaItems: AttachedMedia[] = base64Images
        .slice(0, MAX_ATTACHED_IMAGES - imageCount)
        .map((src, i) => ({
          type: "image" as const,
          src,
          fileName: imageFiles[i].name,
        }));
      addMedia(mediaItems);
    }

    // Process videos (upload to server)
    if (videoFiles.length > 0 && videoCount < MAX_ATTACHED_VIDEOS) {
      setIsUploading(true);
      try {
        for (const vFile of videoFiles.slice(0, MAX_ATTACHED_VIDEOS - videoCount)) {
          const formData = new FormData();
          formData.append("file", vFile);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) continue;

          const { uploadPath } = await response.json();

          let thumbnail = "";
          let duration: number | undefined;
          try {
            thumbnail = await extractVideoThumbnail(vFile);
            const vid = document.createElement("video");
            const url = URL.createObjectURL(vFile);
            vid.src = url;
            vid.preload = "metadata";
            await new Promise<void>((resolve) => {
              vid.onloadedmetadata = () => {
                duration = vid.duration;
                URL.revokeObjectURL(url);
                resolve();
              };
              vid.onerror = () => {
                URL.revokeObjectURL(url);
                resolve();
              };
            });
          } catch {
            // Non-critical
          }

          addMedia([
            {
              type: "video",
              src: thumbnail,
              fileName: vFile.name,
              uploadPath,
              duration,
            },
          ]);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCapture = async () => {
    if (!Component || isCapturing || imageCount >= MAX_ATTACHED_IMAGES) return;

    setIsCapturing(true);
    try {
      const base64 = await captureFrame(Component, currentFrame, {
        width: 1920,
        height: 1080,
        fps,
        durationInFrames,
      });
      addMedia([{ type: "image", src: base64, fileName: "frame-capture.jpg" }]);
    } catch (error) {
      console.error("Failed to capture frame:", error);
    } finally {
      setIsCapturing(false);
    }
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
      const mediaItems: AttachedMedia[] = base64Images
        .slice(0, MAX_ATTACHED_IMAGES - imageCount)
        .map((src, i) => ({
          type: "image" as const,
          src,
          fileName: files[i].name,
        }));
      addMedia(mediaItems);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const canCapture = Component && !isLoading && !isCapturing && imageCount < MAX_ATTACHED_IMAGES;
  const canAttach = !isLoading && (imageCount < MAX_ATTACHED_IMAGES || videoCount < MAX_ATTACHED_VIDEOS);

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div
          className={`bg-[#0c0a1d]/80 rounded-xl border p-3 transition-colors ${
            isDragging ? "border-violet-glow/50 bg-violet-glow/5" : "border-violet-glow/15"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Media previews */}
          {attachedMedia.length > 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 pt-2">
              {attachedMedia.map((media, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {media.type === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={media.src}
                      alt={media.fileName || `Attached ${index + 1}`}
                      className="h-16 w-auto rounded border border-border object-cover"
                    />
                  ) : (
                    <div className="h-16 w-24 rounded border border-border bg-accent/20 flex items-center justify-center relative overflow-hidden">
                      {media.src ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={media.src}
                          alt={media.fileName || "Video"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[7px] px-1 rounded">
                        {media.duration
                          ? `${Math.floor(media.duration / 60)}:${String(Math.floor(media.duration % 60)).padStart(2, "0")}`
                          : "VID"}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {isUploading && (
                <div className="h-16 w-20 rounded border border-border bg-accent/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
              )}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isDragging
                ? "Drop images or videos here..."
                : "Tune your animation... (paste or drop images/videos)"
            }
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground-dim focus:outline-none resize-none text-sm min-h-[36px] max-h-[120px]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={isLoading}
          />
          {/* Hidden file input - now accepts images and videos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
            <Select
              value={model}
              onValueChange={(value) => onModelChange(value as ModelId)}
              disabled={isLoading}
            >
              <SelectTrigger className="max-w-[140px] bg-transparent border-none text-muted-foreground hover:text-foreground transition-colors text-xs h-7 px-2 truncate">
                <SelectValue className="truncate" />
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
                disabled={!canAttach}
                className="text-muted-foreground hover:text-foreground h-7 w-7"
                title="Attach images or videos"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canCapture}
                onClick={handleCapture}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                title="Use current frame of Preview as image in chat"
              >
                <Camera className="w-3.5 h-3.5 mr-1" />
                Use Frame
              </Button>

              <Button
                type="submit"
                size="icon-sm"
                disabled={!prompt.trim() || isLoading}
                loading={isLoading}
                className="bg-gradient-to-r from-violet-glow to-cyan-glow text-white hover:opacity-90 h-7 w-7 ml-1"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
