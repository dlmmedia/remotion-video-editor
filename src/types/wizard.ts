import { z } from "zod";

// ─── Composition Settings ───────────────────────────────────────────────────

export const RESOLUTION_PRESETS = [
  { label: "Landscape 1080p", width: 1920, height: 1080 },
  { label: "Portrait 1080p", width: 1080, height: 1920 },
  { label: "Square", width: 1080, height: 1080 },
  { label: "4K Landscape", width: 3840, height: 2160 },
  { label: "4K Portrait", width: 2160, height: 3840 },
  { label: "720p Landscape", width: 1280, height: 720 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "YouTube Shorts", width: 1080, height: 1920 },
  { label: "Twitter/X Post", width: 1200, height: 675 },
] as const;

export const FPS_OPTIONS = [24, 25, 30, 60] as const;

export const CompositionSettingsSchema = z.object({
  width: z.number().min(100).max(7680).default(1920),
  height: z.number().min(100).max(4320).default(1080),
  fps: z.number().min(1).max(120).default(30),
  durationInFrames: z.number().min(1).max(9000).default(150),
  backgroundColor: z.string().default("#000000"),
});

export type CompositionSettings = z.infer<typeof CompositionSettingsSchema>;

// ─── Render & Export Settings ───────────────────────────────────────────────

export const CODEC_OPTIONS = [
  { value: "h264", label: "H.264 (MP4)" },
  { value: "h265", label: "H.265 (MP4)" },
  { value: "vp8", label: "VP8 (WebM)" },
  { value: "vp9", label: "VP9 (WebM)" },
  { value: "prores", label: "ProRes (MOV)" },
  { value: "gif", label: "GIF" },
] as const;

export const PIXEL_FORMAT_OPTIONS = [
  { value: "yuv420p", label: "YUV 4:2:0 (Standard)" },
  { value: "yuv444p", label: "YUV 4:4:4 (High Quality)" },
] as const;

export const IMAGE_FORMAT_OPTIONS = [
  { value: "jpeg", label: "JPEG (smaller)" },
  { value: "png", label: "PNG (lossless)" },
] as const;

export const PRORES_PROFILE_OPTIONS = [
  { value: "proxy", label: "Proxy" },
  { value: "light", label: "Light" },
  { value: "standard", label: "Standard" },
  { value: "hq", label: "High Quality" },
  { value: "4444", label: "4444" },
  { value: "4444-xq", label: "4444 XQ" },
] as const;

export const RenderSettingsSchema = z.object({
  codec: z
    .enum(["h264", "h265", "vp8", "vp9", "prores", "gif"])
    .default("h264"),
  crf: z.number().min(0).max(63).optional(),
  videoBitrate: z.string().optional(),
  audioBitrate: z.string().optional(),
  pixelFormat: z.enum(["yuv420p", "yuv444p"]).default("yuv420p"),
  imageFormat: z.enum(["jpeg", "png"]).default("jpeg"),
  jpegQuality: z.number().min(0).max(100).default(80),
  proresProfile: z
    .enum(["proxy", "light", "standard", "hq", "4444", "4444-xq"])
    .optional(),
});

export type RenderSettings = z.infer<typeof RenderSettingsSchema>;

// ─── Animation Style ────────────────────────────────────────────────────────

export const ANIMATION_TECHNIQUE_OPTIONS = [
  { value: "spring", label: "Spring (organic motion)" },
  { value: "interpolate", label: "Interpolate (linear)" },
  { value: "mixed", label: "Mixed (spring + interpolate)" },
] as const;

export const PACING_OPTIONS = [
  { value: "slow", label: "Slow / Cinematic" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast / Energetic" },
] as const;

export const TRANSITION_OPTIONS = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "wipe", label: "Wipe" },
  { value: "none", label: "None" },
] as const;

export const FONT_FAMILY_OPTIONS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Space Grotesk, sans-serif", label: "Space Grotesk" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "JetBrains Mono, monospace", label: "JetBrains Mono" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Oswald, sans-serif", label: "Oswald" },
] as const;

export const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
] as const;

export const COLOR_PALETTE_PRESETS = [
  {
    name: "Midnight Violet",
    colors: ["#7C3AED", "#06B6D4", "#1E1B4B", "#F8FAFC"],
  },
  {
    name: "Sunset Gradient",
    colors: ["#F97316", "#EC4899", "#1F2937", "#FFFFFF"],
  },
  {
    name: "Ocean Blue",
    colors: ["#3B82F6", "#0EA5E9", "#0F172A", "#E2E8F0"],
  },
  {
    name: "Forest Green",
    colors: ["#10B981", "#34D399", "#064E3B", "#F0FDF4"],
  },
  {
    name: "Monochrome",
    colors: ["#FFFFFF", "#A1A1AA", "#27272A", "#000000"],
  },
  {
    name: "Neon Nights",
    colors: ["#E879F9", "#22D3EE", "#0A0A0A", "#FDE047"],
  },
  {
    name: "Corporate Blue",
    colors: ["#1D4ED8", "#60A5FA", "#F1F5F9", "#1E293B"],
  },
  {
    name: "Warm Earth",
    colors: ["#D97706", "#A16207", "#FEF3C7", "#451A03"],
  },
] as const;

export const AnimationStyleSchema = z.object({
  technique: z.enum(["spring", "interpolate", "mixed"]).default("mixed"),
  pacing: z.enum(["slow", "medium", "fast"]).default("medium"),
  colorPalette: z.array(z.string()).min(2).max(6).default(["#7C3AED", "#06B6D4", "#1E1B4B", "#F8FAFC"]),
  fontFamily: z.string().default("Inter, sans-serif"),
  fontWeight: z.string().default("600"),
  transition: z.enum(["fade", "slide", "wipe", "none"]).default("fade"),
});

export type AnimationStyle = z.infer<typeof AnimationStyleSchema>;

// ─── Content Direction ──────────────────────────────────────────────────────

export const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "dramatic", label: "Dramatic" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
  { value: "techy", label: "Tech / Modern" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "social-media", label: "Social Media Content" },
  { value: "product-showcase", label: "Product Showcase" },
  { value: "data-viz", label: "Data Visualization" },
  { value: "explainer", label: "Explainer Animation" },
  { value: "title-sequence", label: "Title Sequence / Intro" },
  { value: "logo-animation", label: "Logo Animation" },
  { value: "kinetic-typography", label: "Kinetic Typography" },
  { value: "abstract", label: "Abstract Motion Graphics" },
  { value: "countdown", label: "Countdown / Timer" },
  { value: "infographic", label: "Animated Infographic" },
] as const;

export const ContentDirectionSchema = z.object({
  sceneDescription: z.string().default(""),
  tone: z
    .enum([
      "professional",
      "playful",
      "dramatic",
      "minimal",
      "bold",
      "elegant",
      "techy",
    ])
    .default("professional"),
  category: z
    .enum([
      "social-media",
      "product-showcase",
      "data-viz",
      "explainer",
      "title-sequence",
      "logo-animation",
      "kinetic-typography",
      "abstract",
      "countdown",
      "infographic",
    ])
    .default("explainer"),
  textContent: z.string().default(""),
});

export type ContentDirection = z.infer<typeof ContentDirectionSchema>;

// ─── Reference Media ────────────────────────────────────────────────────────

export const MEDIA_ROLE_OPTIONS = [
  { value: "style-reference", label: "Style Reference" },
  { value: "content-to-include", label: "Content to Include" },
  { value: "background", label: "Background" },
  { value: "overlay", label: "Overlay" },
] as const;

export const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video"]),
  /** base64 data URL for images, or object URL / upload path for videos */
  src: z.string(),
  /** Thumbnail (base64) for videos, same as src for images */
  thumbnail: z.string().optional(),
  /** Original file name */
  fileName: z.string(),
  /** File size in bytes */
  fileSize: z.number(),
  /** MIME type */
  mimeType: z.string(),
  /** Role for this asset in the composition */
  role: z
    .enum(["style-reference", "content-to-include", "background", "overlay"])
    .default("style-reference"),
  /** Upload path on server (for videos) */
  uploadPath: z.string().optional(),
  /** Duration in seconds (for videos) */
  duration: z.number().optional(),
  /** Video dimensions */
  videoWidth: z.number().optional(),
  videoHeight: z.number().optional(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

export const ReferenceMediaSchema = z.object({
  items: z.array(MediaItemSchema).default([]),
});

export type ReferenceMedia = z.infer<typeof ReferenceMediaSchema>;

// ─── Full Wizard Config ─────────────────────────────────────────────────────

export const WizardConfigSchema = z.object({
  composition: CompositionSettingsSchema,
  render: RenderSettingsSchema,
  style: AnimationStyleSchema,
  content: ContentDirectionSchema,
  media: ReferenceMediaSchema,
  modelId: z.string().default("gpt-5.2:low"),
});

export type WizardConfig = z.infer<typeof WizardConfigSchema>;

// ─── Section names for autofill API ─────────────────────────────────────────

export const WIZARD_SECTIONS = [
  "composition",
  "render",
  "style",
  "content",
] as const;

export type WizardSection = (typeof WIZARD_SECTIONS)[number];

// ─── Default config ─────────────────────────────────────────────────────────

export const DEFAULT_WIZARD_CONFIG: WizardConfig = {
  composition: {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    backgroundColor: "#000000",
  },
  render: {
    codec: "h264",
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 80,
  },
  style: {
    technique: "mixed",
    pacing: "medium",
    colorPalette: ["#7C3AED", "#06B6D4", "#1E1B4B", "#F8FAFC"],
    fontFamily: "Inter, sans-serif",
    fontWeight: "600",
    transition: "fade",
  },
  content: {
    sceneDescription: "",
    tone: "professional",
    category: "explainer",
    textContent: "",
  },
  media: {
    items: [],
  },
  modelId: "gpt-5.2:low",
};

export const MAX_IMAGES = 4;
export const MAX_VIDEOS = 4;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
