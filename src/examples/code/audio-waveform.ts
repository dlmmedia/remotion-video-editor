import { DLMMediaExample } from "./index";

export const audioWaveformCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Configuration
  const BAR_COUNT = 32;
  const BAR_WIDTH = 6;
  const BAR_GAP = 4;
  const MAX_HEIGHT = 200;
  const MIN_HEIGHT = 8;
  const COLOR_FROM = [99, 102, 241]; // #6366f1 indigo
  const COLOR_TO = [6, 182, 212]; // #06b6d4 cyan
  const COLOR_BG = "#0a0a0a";
  const GLOW_OPACITY = 0.4;

  // Generate bar data with unique frequencies
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const freq = 0.08 + (i % 7) * 0.025 + Math.sin(i * 0.9) * 0.02;
    const phase = i * 0.7 + Math.cos(i * 1.3) * 2;
    const amp = 0.5 + Math.sin(i * 0.4 + 1) * 0.3 + Math.cos(i * 0.8) * 0.2;
    return { freq, phase, amp };
  });

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: interpolate(entrance, [0, 1], [0, 0.6]),
        }}
      >
        Now Playing
      </div>

      {/* Waveform bars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: BAR_GAP,
        }}
      >
        {bars.map((bar, i) => {
          const staggerDelay = i * 2;
          const barEntrance = spring({
            frame: frame - staggerDelay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          const wave = Math.sin(frame * bar.freq + bar.phase) * bar.amp;
          const normalizedWave = (wave + 1) / 2;
          const height = (MIN_HEIGHT + normalizedWave * (MAX_HEIGHT - MIN_HEIGHT)) * barEntrance;

          // Lerp color based on bar position
          const t = i / (BAR_COUNT - 1);
          const r = Math.round(COLOR_FROM[0] + (COLOR_TO[0] - COLOR_FROM[0]) * t);
          const g = Math.round(COLOR_FROM[1] + (COLOR_TO[1] - COLOR_FROM[1]) * t);
          const b = Math.round(COLOR_FROM[2] + (COLOR_TO[2] - COLOR_FROM[2]) * t);
          const color = \`rgb(\${r}, \${g}, \${b})\`;

          return (
            <div
              key={i}
              style={{
                width: BAR_WIDTH,
                height,
                borderRadius: BAR_WIDTH / 2,
                backgroundColor: color,
                filter: \`drop-shadow(0 0 6px rgba(\${r}, \${g}, \${b}, \${GLOW_OPACITY}))\`,
              }}
            />
          );
        })}
      </div>

      {/* Track info */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          textAlign: "center",
          opacity: interpolate(entrance, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Midnight Frequencies
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 14,
            marginTop: 6,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Ambient Waves
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const audioWaveformExample: DLMMediaExample = {
  id: "audio-waveform",
  name: "Audio Waveform",
  description: "Pulsing equalizer bars with neon gradient and glow effects",
  category: "Audio",
  durationInFrames: 180,
  fps: 30,
  code: audioWaveformCode,
};
