import { DLMMediaExample } from "./index";

export const podcastCardCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Content
  const EPISODE_NUMBER = "EPISODE 42";
  const TITLE = "The Future of Creative AI";
  const SHOW_NAME = "Design Forward";
  const DURATION = "32 min";

  // Colors
  const COLOR_BG = "#0a0a0a";
  const COLOR_CARD = "#141414";
  const COLOR_BORDER = "rgba(139, 92, 246, 0.3)";
  const COLOR_GLOW = "rgba(139, 92, 246, 0.08)";
  const COLOR_ACCENT = "#8b5cf6";
  const COLOR_TEXT = "#ffffff";
  const COLOR_MUTED = "#6b7280";
  const COLOR_BADGE_BG = "rgba(139, 92, 246, 0.15)";

  // Layout
  const CARD_WIDTH = 420;
  const ART_SIZE = 420;
  const CARD_PADDING = 28;
  const CARD_RADIUS = 20;

  // Timing
  const STAGGER = 8;

  // Spring animations
  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const artEntrance = spring({
    frame: frame - STAGGER,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const badgeEntrance = spring({
    frame: frame - STAGGER * 2,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const titleEntrance = spring({
    frame: frame - STAGGER * 3,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const metaEntrance = spring({
    frame: frame - STAGGER * 4,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const playEntrance = spring({
    frame: frame - STAGGER * 5,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  // Play button pulse
  const pulsePhase = Math.sin(frame * 0.08) * 0.5 + 0.5;
  const playGlow = interpolate(pulsePhase, [0, 1], [0.3, 0.7]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Card container */}
      <div
        style={{
          width: CARD_WIDTH,
          backgroundColor: COLOR_CARD,
          borderRadius: CARD_RADIUS,
          border: \`1px solid \${COLOR_BORDER}\`,
          boxShadow: \`0 0 40px \${COLOR_GLOW}\`,
          overflow: "hidden",
          opacity: cardEntrance,
          transform: \`translateY(\${interpolate(cardEntrance, [0, 1], [30, 0])}px)\`,
        }}
      >
        {/* Artwork placeholder */}
        <div
          style={{
            width: ART_SIZE,
            height: ART_SIZE * 0.65,
            background: "linear-gradient(135deg, #4c1d95, #7c3aed, #2563eb)",
            opacity: artEntrance,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Decorative mic icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 28,
            }}
          >
            🎙
          </div>
        </div>

        {/* Content area */}
        <div style={{ padding: CARD_PADDING }}>
          {/* Episode badge */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 6,
              backgroundColor: COLOR_BADGE_BG,
              color: COLOR_ACCENT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              fontFamily: "Inter, system-ui, sans-serif",
              opacity: badgeEntrance,
              transform: \`scale(\${badgeEntrance})\`,
              marginBottom: 14,
            }}
          >
            {EPISODE_NUMBER}
          </div>

          {/* Title */}
          <div
            style={{
              color: COLOR_TEXT,
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.3,
              fontFamily: "Inter, system-ui, sans-serif",
              marginBottom: 12,
              opacity: titleEntrance,
              transform: \`translateY(\${interpolate(titleEntrance, [0, 1], [10, 0])}px)\`,
            }}
          >
            {TITLE}
          </div>

          {/* Meta row: show name + duration */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: metaEntrance,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                color: COLOR_MUTED,
                fontSize: 14,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {SHOW_NAME}
            </span>
            <span
              style={{
                color: COLOR_MUTED,
                fontSize: 13,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {DURATION}
            </span>
          </div>

          {/* Play button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              opacity: playEntrance,
              transform: \`scale(\${playEntrance})\`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: COLOR_ACCENT,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: \`0 0 20px rgba(139, 92, 246, \${playGlow})\`,
              }}
            >
              {/* Play triangle */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "14px solid #ffffff",
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  marginLeft: 3,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const podcastCardExample: DLMMediaExample = {
  id: "podcast-card",
  name: "Podcast Episode Card",
  description: "Animated podcast card with artwork, title, and play button",
  category: "Audio",
  durationInFrames: 150,
  fps: 30,
  code: podcastCardCode,
};
