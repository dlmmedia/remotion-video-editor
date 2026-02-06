import { DLMMediaExample } from "./index";

export const musicPlayerCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Content
  const TRACK_NAME = "Midnight Drive";
  const ARTIST = "Neon Pulse";
  const TOTAL_TIME = "3:24";

  // Colors
  const COLOR_BG = "#0f0f0f";
  const COLOR_CARD = "rgba(24, 24, 27, 0.95)";
  const COLOR_BORDER = "rgba(63, 63, 70, 0.5)";
  const COLOR_TEXT = "#ffffff";
  const COLOR_MUTED = "#71717a";
  const COLOR_ACCENT = "#a855f7";
  const COLOR_PROGRESS_BG = "#27272a";
  const COLOR_PROGRESS = "linear-gradient(90deg, #a855f7, #6366f1)";

  // Layout
  const CARD_WIDTH = 380;
  const ART_SIZE = 280;
  const CARD_PADDING = 24;
  const CARD_RADIUS = 24;

  // Card entrance
  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const cardY = interpolate(cardEntrance, [0, 1], [40, 0]);
  const cardOpacity = cardEntrance;

  // Progress animation
  const progress = interpolate(
    frame,
    [20, durationInFrames - 10],
    [0, 80],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Current time calculation from progress
  const totalSeconds = 204; // 3:24
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const currentTime = \`\${minutes}:\${seconds.toString().padStart(2, "0")}\`;

  // Subtle art shimmer
  const shimmer = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0, 15]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Player card */}
      <div
        style={{
          width: CARD_WIDTH,
          backgroundColor: COLOR_CARD,
          borderRadius: CARD_RADIUS,
          border: \`1px solid \${COLOR_BORDER}\`,
          overflow: "hidden",
          opacity: cardOpacity,
          transform: \`translateY(\${cardY}px)\`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Album art */}
        <div
          style={{
            width: "100%",
            height: ART_SIZE,
            background: \`linear-gradient(\${135 + shimmer}deg, #1e1b4b, #581c87, #312e81)\`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Music note icon */}
          <div
            style={{
              fontSize: 56,
              opacity: 0.3,
            }}
          >
            ♫
          </div>
        </div>

        {/* Track info */}
        <div style={{ padding: CARD_PADDING }}>
          {/* Title row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                color: COLOR_TEXT,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {TRACK_NAME}
            </div>
          </div>

          {/* Artist */}
          <div
            style={{
              color: COLOR_MUTED,
              fontSize: 14,
              fontFamily: "Inter, system-ui, sans-serif",
              marginBottom: 24,
            }}
          >
            {ARTIST}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              height: 4,
              backgroundColor: COLOR_PROGRESS_BG,
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: \`\${progress}%\`,
                height: "100%",
                background: COLOR_PROGRESS,
                borderRadius: 2,
                position: "relative",
              }}
            >
              {/* Progress dot */}
              <div
                style={{
                  position: "absolute",
                  right: -5,
                  top: -3,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: COLOR_ACCENT,
                  boxShadow: \`0 0 8px \${COLOR_ACCENT}\`,
                }}
              />
            </div>
          </div>

          {/* Time row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                color: COLOR_MUTED,
                fontSize: 12,
                fontFamily: "Inter, system-ui, sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currentTime}
            </span>
            <span
              style={{
                color: COLOR_MUTED,
                fontSize: 12,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {TOTAL_TIME}
            </span>
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
            }}
          >
            {/* Previous */}
            <div
              style={{
                color: COLOR_MUTED,
                fontSize: 18,
                fontFamily: "system-ui",
                cursor: "pointer",
              }}
            >
              ⏮
            </div>

            {/* Play button */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: COLOR_TEXT,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid #0f0f0f",
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  marginLeft: 4,
                }}
              />
            </div>

            {/* Next */}
            <div
              style={{
                color: COLOR_MUTED,
                fontSize: 18,
                fontFamily: "system-ui",
                cursor: "pointer",
              }}
            >
              ⏭
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const musicPlayerExample: DLMMediaExample = {
  id: "music-player",
  name: "Music Player",
  description: "Sleek music player card with progress bar and playback controls",
  category: "Audio",
  durationInFrames: 180,
  fps: 30,
  code: musicPlayerCode,
};
