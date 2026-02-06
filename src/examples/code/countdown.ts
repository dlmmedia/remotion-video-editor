import { DLMMediaExample } from "./index";

export const countdownCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Configuration
  const NUMBERS = [5, 4, 3, 2, 1];
  const GO_TEXT = "GO";
  const FRAMES_PER_NUMBER = 30;
  const COLOR_BG = "#0a0a0a";
  const FONT_SIZE = 200;
  const GO_FONT_SIZE = 160;

  const COLORS = [
    "#6366f1", // 5 - indigo
    "#8b5cf6", // 4 - violet
    "#a855f7", // 3 - purple
    "#ec4899", // 2 - pink
    "#ef4444", // 1 - red
    "#10b981", // GO - emerald
  ];

  const totalNumberFrames = NUMBERS.length * FRAMES_PER_NUMBER;
  const isGoPhase = frame >= totalNumberFrames;
  const goFrame = frame - totalNumberFrames;

  // Current number phase
  const currentIndex = Math.min(
    Math.floor(frame / FRAMES_PER_NUMBER),
    NUMBERS.length
  );
  const frameInPhase = frame % FRAMES_PER_NUMBER;

  // Number entrance spring
  const numberEntrance = spring({
    frame: frameInPhase,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Number exit (blur + fade in last 8 frames of phase)
  const exitStart = FRAMES_PER_NUMBER - 8;
  const exitProgress = interpolate(
    frameInPhase,
    [exitStart, FRAMES_PER_NUMBER],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // GO spring (more dramatic overshoot)
  const goEntrance = spring({
    frame: goFrame,
    fps,
    config: { damping: 8, stiffness: 180 },
  });

  // Background pulse on each number change
  const pulse = spring({
    frame: frameInPhase,
    fps,
    config: { damping: 20, stiffness: 300 },
  });
  const ringSize = interpolate(pulse, [0, 1], [0, 400]);
  const ringOpacity = interpolate(pulse, [0, 1], [0.3, 0]);

  if (isGoPhase) {
    // GO phase
    const goScale = interpolate(goEntrance, [0, 1], [0, 1]);
    const goOpacity = goEntrance;

    return (
      <AbsoluteFill
        style={{
          backgroundColor: COLOR_BG,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Glow ring */}
        <div
          style={{
            position: "absolute",
            width: 500 * goEntrance,
            height: 500 * goEntrance,
            borderRadius: "50%",
            border: \`3px solid \${COLORS[5]}\`,
            opacity: interpolate(goEntrance, [0, 0.5, 1], [0, 0.4, 0]),
          }}
        />

        <div
          style={{
            fontSize: GO_FONT_SIZE,
            fontWeight: 900,
            fontFamily: "Inter, system-ui, sans-serif",
            color: COLORS[5],
            transform: \`scale(\${goScale})\`,
            opacity: goOpacity,
            textShadow: \`0 0 40px \${COLORS[5]}80, 0 0 80px \${COLORS[5]}40\`,
            letterSpacing: 12,
          }}
        >
          {GO_TEXT}
        </div>
      </AbsoluteFill>
    );
  }

  // Number phase
  const currentNumber = NUMBERS[currentIndex] || 1;
  const currentColor = COLORS[currentIndex] || COLORS[0];
  const scale = interpolate(numberEntrance, [0, 1], [0.3, 1]);
  const opacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const blur = interpolate(exitProgress, [0, 1], [0, 12]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: \`2px solid \${currentColor}\`,
          opacity: ringOpacity,
        }}
      />

      {/* Number */}
      <div
        style={{
          fontSize: FONT_SIZE,
          fontWeight: 900,
          fontFamily: "Inter, system-ui, sans-serif",
          color: currentColor,
          transform: \`scale(\${scale})\`,
          opacity,
          filter: \`blur(\${blur}px)\`,
          textShadow: \`0 0 30px \${currentColor}60\`,
        }}
      >
        {currentNumber}
      </div>

      {/* Subtle progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 12,
        }}
      >
        {NUMBERS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= currentIndex ? COLORS[i] : "#333",
              opacity: i <= currentIndex ? 1 : 0.4,
              transition: "background-color 0.2s",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};`;

export const countdownExample: DLMMediaExample = {
  id: "countdown",
  name: "Countdown Timer",
  description: "Dramatic 5-to-1 countdown with pulse rings and GO finale",
  category: "Animation",
  durationInFrames: 180,
  fps: 30,
  code: countdownCode,
};
