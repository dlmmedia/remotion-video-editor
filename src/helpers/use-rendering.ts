import { z } from "zod";
import { useCallback, useMemo, useRef, useState } from "react";
import { getProgress, renderVideo } from "../lambda/api";
import { CompositionProps } from "../../types/constants";

// Max time to wait for rendering to complete (5 minutes)
const MAX_RENDER_TIMEOUT_MS = 5 * 60 * 1000;
// Max consecutive progress poll failures before giving up
const MAX_POLL_FAILURES = 5;
// Polling interval in milliseconds
const POLL_INTERVAL_MS = 1500;

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
    }
  | {
      renderId: string;
      bucketName: string;
      progress: number;
      status: "rendering";
    }
  | {
      renderId: string | null;
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: "done";
    };

const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};

export const useRendering = (
  inputProps: z.infer<typeof CompositionProps>,
) => {
  const [state, setState] = useState<State>({
    status: "init",
  });
  const abortRef = useRef(false);

  const renderMedia = useCallback(async () => {
    abortRef.current = false;
    setState({
      status: "invoking",
    });
    try {
      const { renderId, bucketName } = await renderVideo({ inputProps });
      if (abortRef.current) return;

      setState({
        status: "rendering",
        progress: 0,
        renderId: renderId,
        bucketName: bucketName,
      });

      let pending = true;
      const startTime = Date.now();
      let consecutiveFailures = 0;

      while (pending) {
        if (abortRef.current) return;

        // Check for overall timeout
        if (Date.now() - startTime > MAX_RENDER_TIMEOUT_MS) {
          setState({
            status: "error",
            renderId: renderId,
            error: new Error(
              "Rendering timed out after 5 minutes. The video may be too complex or the render service is overloaded. Please try again.",
            ),
          });
          return;
        }

        try {
          const result = await getProgress({
            id: renderId,
            bucketName: bucketName,
          });

          // Reset failure count on successful poll
          consecutiveFailures = 0;

          switch (result.type) {
            case "error": {
              setState({
                status: "error",
                renderId: renderId,
                error: new Error(result.message),
              });
              pending = false;
              break;
            }
            case "done": {
              setState({
                size: result.size,
                url: result.url,
                status: "done",
              });
              pending = false;
              break;
            }
            case "progress": {
              setState({
                status: "rendering",
                bucketName: bucketName,
                progress: result.progress,
                renderId: renderId,
              });
              await wait(POLL_INTERVAL_MS);
            }
          }
        } catch (pollErr) {
          consecutiveFailures++;
          if (consecutiveFailures >= MAX_POLL_FAILURES) {
            setState({
              status: "error",
              renderId: renderId,
              error: new Error(
                `Lost connection to render service after ${MAX_POLL_FAILURES} failed attempts. Please check your connection and try again.`,
              ),
            });
            return;
          }
          // Wait a bit longer before retrying after a failure
          await wait(POLL_INTERVAL_MS * 2);
        }
      }
    } catch (err) {
      if (abortRef.current) return;
      const message = err instanceof Error ? err.message : String(err);
      setState({
        status: "error",
        error: new Error(
          message.includes("Failed to fetch") || message.includes("NetworkError")
            ? "Could not reach the render service. This may be a network issue or the server timed out. Please try again."
            : message,
        ),
        renderId: null,
      });
    }
  }, [inputProps]);

  const undo = useCallback(() => {
    abortRef.current = true;
    setState({ status: "init" });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
