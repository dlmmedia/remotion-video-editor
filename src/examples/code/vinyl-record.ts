import { DLMMediaExample } from "./index";

export const vinylRecordCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Configuration
  const DISC_SIZE = 340;
  const LABEL_SIZE = 110;
  const COLOR_BG = "#111111";
  const COLOR_DISC = "#1a1a1a";
  const COLOR_GROOVE = "rgba(255,255,255,0.04)";
  const GROOVE_COUNT = 18;
  const SPIN_SPEED = 2; // degrees per frame (33 RPM feel)

  // Tonearm config
  const ARM_LENGTH = 180;
  const ARM_COLOR = "#c0c0c0";

  // Spring for tonearm drop
  const armDrop = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Disc entrance
  const discEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  // Continuous rotation
  const rotation = frame * SPIN_SPEED;

  // Tonearm rotation: from -15deg (resting) to 5deg (on record)
  const armAngle = interpolate(armDrop, [0, 1], [-15, 5]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Disc container */}
      <div
        style={{
          position: "relative",
          width: DISC_SIZE,
          height: DISC_SIZE,
          opacity: discEntrance,
          transform: \`scale(\${interpolate(discEntrance, [0, 1], [0.8, 1])})\`,
        }}
      >
        {/* Vinyl disc */}
        <div
          style={{
            width: DISC_SIZE,
            height: DISC_SIZE,
            borderRadius: "50%",
            backgroundColor: COLOR_DISC,
            transform: \`rotate(\${rotation}deg)\`,
            position: "relative",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Groove rings */}
          {Array.from({ length: GROOVE_COUNT }, (_, i) => {
            const size = LABEL_SIZE + 20 + ((DISC_SIZE - LABEL_SIZE - 20) / GROOVE_COUNT) * (i + 1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  border: \`1px solid \${COLOR_GROOVE}\`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}

          {/* Center label */}
          <div
            style={{
              width: LABEL_SIZE,
              height: LABEL_SIZE,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Spindle hole */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: COLOR_DISC,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                color: "#ffffff",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              DLM Media
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 7,
                fontFamily: "Inter, system-ui, sans-serif",
                marginTop: 2,
              }}
            >
              Side A
            </div>
          </div>

          {/* Outer rim highlight */}
          <div
            style={{
              position: "absolute",
              width: DISC_SIZE - 4,
              height: DISC_SIZE - 4,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
              top: 2,
              left: 2,
            }}
          />
        </div>
      </div>

      {/* Tonearm */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: \`translate(\${DISC_SIZE * 0.42}px, \${-DISC_SIZE * 0.52}px)\`,
        }}
      >
        {/* Arm pivot */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#888",
            position: "relative",
            zIndex: 2,
          }}
        />
        {/* Arm body */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 3,
            height: ARM_LENGTH,
            backgroundColor: ARM_COLOR,
            transformOrigin: "top center",
            transform: \`rotate(\${armAngle}deg)\`,
            borderRadius: 2,
            boxShadow: "2px 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {/* Headshell */}
          <div
            style={{
              position: "absolute",
              bottom: -2,
              left: -4,
              width: 11,
              height: 18,
              backgroundColor: ARM_COLOR,
              borderRadius: "2px 2px 4px 4px",
            }}
          />
          {/* Cartridge */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: -1,
              width: 5,
              height: 6,
              backgroundColor: "#333",
              borderRadius: 1,
            }}
          />
        </div>
      </div>

      {/* Track label */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          textAlign: "center",
          opacity: interpolate(discEntrance, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Golden Hour
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginTop: 4,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          33 RPM
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const vinylRecordExample: DLMMediaExample = {
  id: "vinyl-record",
  name: "Vinyl Record",
  description: "Spinning vinyl disc with grooves, label, and animated tonearm",
  category: "Audio",
  durationInFrames: 300,
  fps: 30,
  code: vinylRecordCode,
};
