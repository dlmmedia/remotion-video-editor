import type { WizardConfig, MediaItem } from "@/types/wizard";
import {
  TONE_OPTIONS,
  CATEGORY_OPTIONS,
  ANIMATION_TECHNIQUE_OPTIONS,
  PACING_OPTIONS,
  TRANSITION_OPTIONS,
} from "@/types/wizard";

function labelFor<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string,
): string {
  const match = options.find((o) => o.value === value);
  return match ? match.label : value;
}

function formatMediaItem(item: MediaItem): string {
  const typeLabel = item.type === "video" ? "Video" : "Image";
  const role = item.role.replace(/-/g, " ");
  let info = `- ${typeLabel}: "${item.fileName}" (${role})`;
  if (item.type === "video") {
    if (item.duration) info += ` [${item.duration.toFixed(1)}s]`;
    if (item.videoWidth && item.videoHeight)
      info += ` [${item.videoWidth}x${item.videoHeight}]`;
    if (item.uploadPath)
      info += `\n  Use: staticFile("${item.uploadPath}")`;
  }
  return info;
}

/**
 * Assembles a wizard config into a rich, structured prompt
 * that the generation API can understand.
 */
export function assemblePrompt(config: WizardConfig): string {
  const { composition, style, content, media } = config;
  const parts: string[] = [];

  // Title line: category + tone + scene description
  const categoryLabel = labelFor(CATEGORY_OPTIONS, content.category);
  const toneLabel = labelFor(TONE_OPTIONS, content.tone);
  const scene = content.sceneDescription.trim();

  if (scene) {
    parts.push(`${categoryLabel} (${toneLabel}): ${scene}`);
  }

  // Composition
  const seconds = (composition.durationInFrames / composition.fps).toFixed(2);
  parts.push(
    `\nComposition: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames (${seconds}s)`,
  );
  parts.push(`Background: ${composition.backgroundColor}`);

  // Style
  const techniqueLabel = labelFor(ANIMATION_TECHNIQUE_OPTIONS, style.technique);
  const pacingLabel = labelFor(PACING_OPTIONS, style.pacing);
  const transitionLabel = labelFor(TRANSITION_OPTIONS, style.transition);
  parts.push(
    `Style: ${pacingLabel} pacing, ${techniqueLabel} animation, ${transitionLabel} transitions`,
  );
  parts.push(`Typography: ${style.fontFamily}, weight ${style.fontWeight}`);
  parts.push(`Colors: ${style.colorPalette.join(", ")}`);

  // Text content
  if (content.textContent.trim()) {
    parts.push(`\nText content to display:\n${content.textContent.trim()}`);
  }

  // Reference media
  const mediaItems = media.items.filter((item) => item.src || item.uploadPath);
  if (mediaItems.length > 0) {
    parts.push(`\nReference media:`);
    for (const item of mediaItems) {
      parts.push(formatMediaItem(item));
    }
  }

  return parts.join("\n");
}

/**
 * Extracts just the render settings from the wizard config
 * for passing to the Lambda render endpoint.
 */
export function extractRenderSettings(config: WizardConfig) {
  return {
    codec: config.render.codec,
    crf: config.render.crf,
    videoBitrate: config.render.videoBitrate,
    audioBitrate: config.render.audioBitrate,
    pixelFormat: config.render.pixelFormat,
    imageFormat: config.render.imageFormat,
    jpegQuality: config.render.jpegQuality,
    proresProfile: config.render.proresProfile,
  };
}
