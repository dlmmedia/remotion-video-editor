"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { ImageIcon, Video, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/types/wizard";
import {
  MEDIA_ROLE_OPTIONS,
  MAX_IMAGES,
  MAX_VIDEOS,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/types/wizard";
import { SectionHeader } from "./SectionHeader";

interface ReferenceMediaSectionProps {
  items: MediaItem[];
  onAddItem: (item: MediaItem) => void;
  onRemoveItem: (id: string) => void;
  onUpdateRole: (id: string, role: MediaItem["role"]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function generateId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video"));
    };
  });
}

async function getVideoDuration(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video metadata"));
    };
  });
}

export function ReferenceMediaSection({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateRole,
  isOpen,
  onToggle,
}: ReferenceMediaSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageCount = items.filter((i) => i.type === "image").length;
  const videoCount = items.filter((i) => i.type === "video").length;

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      for (const file of files) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) continue;

        // Size validation
        if (isImage && file.size > MAX_IMAGE_SIZE) {
          setUploadError(`Image "${file.name}" exceeds 10MB limit`);
          continue;
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          setUploadError(`Video "${file.name}" exceeds 50MB limit`);
          continue;
        }

        // Limit checks
        if (isImage && imageCount >= MAX_IMAGES) {
          setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
          continue;
        }
        if (isVideo && videoCount >= MAX_VIDEOS) {
          setUploadError(`Maximum ${MAX_VIDEOS} videos allowed`);
          continue;
        }

        if (isImage) {
          const base64 = await fileToBase64(file);
          onAddItem({
            id: generateId(),
            type: "image",
            src: base64,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            role: "style-reference",
          });
        } else if (isVideo) {
          // Upload video to server
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            setUploadError(error.error || "Upload failed");
            continue;
          }

          const { uploadPath } = await response.json();

          // Extract thumbnail and metadata
          let thumbnail: string | undefined;
          let meta: { duration: number; width: number; height: number } | undefined;

          try {
            [thumbnail, meta] = await Promise.all([
              extractVideoThumbnail(file),
              getVideoDuration(file),
            ]);
          } catch {
            // Non-critical: proceed without thumbnail/meta
          }

          onAddItem({
            id: generateId(),
            type: "video",
            src: URL.createObjectURL(file),
            thumbnail,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            role: "content-to-include",
            uploadPath,
            duration: meta?.duration,
            videoWidth: meta?.width,
            videoHeight: meta?.height,
          });
        }
      }
    } catch (err) {
      console.error("Error processing files:", err);
      setUploadError("Failed to process files");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = "";
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

  return (
    <SectionHeader
      title="Reference Media"
      icon={<ImageIcon className="w-4 h-4" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-violet-glow/50 bg-violet-glow/5"
            : "border-border/40 hover:border-violet-glow/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto text-muted-foreground-dim mb-2" />
            <p className="text-xs text-muted-foreground mb-1">
              Drag & drop images or videos
            </p>
            <p className="text-[10px] text-muted-foreground-dim mb-3">
              Images: max {MAX_IMAGES} (10MB each) / Videos: max {MAX_VIDEOS} (50MB each)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              Browse Files
            </Button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}

      {/* Media items list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-accent/10"
            >
              {/* Thumbnail */}
              <div className="w-14 h-10 rounded overflow-hidden bg-background flex-shrink-0 relative">
                {item.type === "image" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.src}
                    alt={item.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {item.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.thumbnail}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    {/* Video badge */}
                    <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded">
                      {item.duration
                        ? `${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, "0")}`
                        : "VID"}
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">
                  {item.fileName}
                </p>
                <p className="text-[10px] text-muted-foreground-dim">
                  {item.type === "video" && item.videoWidth && item.videoHeight
                    ? `${item.videoWidth}x${item.videoHeight} - `
                    : ""}
                  {formatFileSize(item.fileSize)}
                </p>
              </div>

              {/* Role selector */}
              <select
                value={item.role}
                onChange={(e) =>
                  onUpdateRole(item.id, e.target.value as MediaItem["role"])
                }
                className="px-1.5 py-1 rounded border border-border bg-input text-foreground text-[10px] focus:outline-none focus:border-violet-glow/40 max-w-[100px]"
              >
                {MEDIA_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="text-[10px] text-muted-foreground-dim">
        {imageCount} image{imageCount !== 1 ? "s" : ""}, {videoCount} video
        {videoCount !== 1 ? "s" : ""} attached
      </p>
    </SectionHeader>
  );
}
