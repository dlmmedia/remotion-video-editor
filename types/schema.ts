import { z } from "zod";
import { CompositionProps, RenderOptionsSchema } from "./constants";

export const RenderRequest = z.object({
  inputProps: CompositionProps,
  renderOptions: RenderOptionsSchema.optional(),
});

export const ProgressRequest = z.object({
  bucketName: z.string(),
  id: z.string(),
});

export type ProgressResponse =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "done";
      url: string;
      size: number;
    };
