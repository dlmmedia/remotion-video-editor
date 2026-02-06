import { DLMMediaExample } from "./index";

export const spectrumCircleCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Configuration
  const BAR_COUNT = 48;
  const INNER_RADIUS = 80;
  const MIN_BAR_HEIGHT = 8;
  const MAX_BAR_HEIGHT = 80;
  const BAR_WIDTH = 4;
  const COLOR_BG = "#050510";
  const CENTER_SIZE = 60;

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Generate bars around the circle
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

    // Unique wave per bar
    const freq1 = 0.07 + (i % 5) * 0.02;
    const freq2 = 0.12 + (i % 3) * 0.03;
    const phase = i * 0.5;
    const wave = (Math.sin(frame * freq1 + phase) + Math.sin(frame * freq2 + phase * 1.3)) / 2;
    const normalizedWave = (wave + 1) / 2;

    const barHeight = MIN_BAR_HEIGHT + normalizedWave * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);

    // Color based on angle position (magenta -> cyan -> magenta)
    const hue = (i / BAR_COUNT) * 360 + 280;

    return { angle, barHeight, hue };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Spectrum container */}
      <div
        style={{
          position: "relative",
          width: (INNER_RADIUS + MAX_BAR_HEIGHT) * 2 + 40,
          height: (INNER_RADIUS + MAX_BAR_HEIGHT) * 2 + 40,
          opacity: entrance,
          transform: \`scale(\${interpolate(entrance, [0, 1], [0.6, 1])})\`,
        }}
      >
        {/* Bars */}
        {bars.map((bar, i) => {
          const staggerDelay = i * 1;
          const barEntrance = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 10, stiffness: 200 },
          });

          const height = bar.barHeight * barEntrance;
          const cx = (INNER_RADIUS + MAX_BAR_HEIGHT) + 20;
          const cy = (INNER_RADIUS + MAX_BAR_HEIGHT) + 20;

          // Position bar at the edge of inner circle
          const x = cx + Math.cos(bar.angle) * INNER_RADIUS;
          const y = cy + Math.sin(bar.angle) * INNER_RADIUS;

          const rotationDeg = (bar.angle * 180) / Math.PI + 90;

          const color = \`hsl(\${bar.hue % 360}, 80%, 65%)\`;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - BAR_WIDTH / 2,
                top: y,
                width: BAR_WIDTH,
                height: height,
                borderRadius: BAR_WIDTH / 2,
                backgroundColor: color,
                transformOrigin: "top center",
                transform: \`rotate(\${rotationDeg}deg)\`,
                filter: \`drop-shadow(0 0 4px \${color})\`,
              }}
            />
          );
        })}

        {/* Center circle */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.15)",
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Play icon */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "16px solid rgba(255,255,255,0.8)",
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              marginLeft: 4,
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          textAlign: "center",
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 2,
          }}
        >
          SPECTRUM
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 12,
            marginTop: 4,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Audio Visualizer
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const spectrumCircleExample: DLMMediaExample = {
  id: "spectrum-circle",
  name: "Sound Spectrum Circle",
  description: "Circular audio visualizer with radiating bars and neon glow",
  category: "Audio",
  durationInFrames: 240,
  fps: 30,
  code: spectrumCircleCode,
};
