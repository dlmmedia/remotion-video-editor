import { z } from "zod";

export const COMP_NAME = "DynamicComp";

export const CompositionProps = z.object({
  code: z.string(),
  durationInFrames: z.number(),
  fps: z.number(),
});

export const RenderOptionsSchema = z.object({
  codec: z
    .enum(["h264", "h265", "vp8", "vp9", "prores", "gif"])
    .optional()
    .default("h264"),
  crf: z.number().min(0).max(63).optional(),
  videoBitrate: z.string().optional(),
  audioBitrate: z.string().optional(),
  pixelFormat: z.enum(["yuv420p", "yuv444p"]).optional(),
  imageFormat: z.enum(["jpeg", "png"]).optional(),
  jpegQuality: z.number().min(0).max(100).optional(),
  proresProfile: z
    .enum(["proxy", "light", "standard", "hq", "4444", "4444-xq"])
    .optional(),
});
