import { AwsRegion, RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import {
  renderMediaOnLambda,
  speculateFunctionName,
} from "@remotion/lambda/client";
import {
  DISK,
  RAM,
  REGION,
  SITE_NAME,
  TIMEOUT,
} from "../../../../../config.mjs";
import { COMP_NAME } from "../../../../../types/constants";
import { RenderRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";
import type { z } from "zod";
import type { RenderOptionsSchema } from "../../../../../types/constants";

export const POST = executeApi<RenderMediaOnLambdaOutput, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    if (
      !process.env.AWS_ACCESS_KEY_ID &&
      !process.env.REMOTION_AWS_ACCESS_KEY_ID
    ) {
      throw new TypeError(
        "Set up Remotion Lambda to render videos. See the README.md for how to do so.",
      );
    }
    if (
      !process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
    ) {
      throw new TypeError(
        "The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.",
      );
    }

    const opts: Partial<z.infer<typeof RenderOptionsSchema>> = body.renderOptions ?? {};
    const codec = opts.codec ?? "h264";

    // Determine file extension based on codec
    const extMap: Record<string, string> = {
      h264: "mp4",
      h265: "mp4",
      vp8: "webm",
      vp9: "webm",
      prores: "mov",
      gif: "gif",
    };
    const ext = extMap[codec] ?? "mp4";

    const result = await renderMediaOnLambda({
      codec,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      serveUrl: SITE_NAME,
      composition: COMP_NAME,
      inputProps: body.inputProps,
      framesPerLambda: 60,
      downloadBehavior: {
        type: "download",
        fileName: `video.${ext}`,
      },
      ...(opts.crf !== undefined && { crf: opts.crf }),
      ...(opts.videoBitrate && { videoBitrate: opts.videoBitrate }),
      ...(opts.audioBitrate && { audioBitrate: opts.audioBitrate }),
      ...(opts.pixelFormat && { pixelFormat: opts.pixelFormat }),
      ...(opts.imageFormat && { imageFormat: opts.imageFormat }),
      ...(opts.jpegQuality !== undefined && { jpegQuality: opts.jpegQuality }),
      ...(opts.proresProfile && codec === "prores" && { proresProfile: opts.proresProfile }),
    });

    return result;
  },
);
