import { DLMMediaExample } from "./index";

export const quoteCardCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "dlm-media";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Content
  const QUOTE = "Design is not just what it looks like. Design is how it works.";
  const ATTRIBUTION = "Steve Jobs";

  // Colors
  const COLOR_BG = "#0f0f0f";
  const COLOR_TEXT = "#f0f0f0";
  const COLOR_QUOTE_MARK = "rgba(139, 92, 246, 0.2)";
  const COLOR_ATTRIBUTION = "#8b5cf6";
  const COLOR_DASH = "#4b5563";

  // Layout
  const MAX_WIDTH = Math.min(700, width - 100);
  const QUOTE_FONT_SIZE = 32;
  const ATTR_FONT_SIZE = 18;
  const QUOTE_MARK_SIZE = 120;

  // Timing
  const WORDS = QUOTE.split(" ");
  const FRAMES_PER_WORD = 3;
  const QUOTE_START = 15; // after quote marks entrance
  const ATTR_START = QUOTE_START + WORDS.length * FRAMES_PER_WORD + 15;

  // Quote marks entrance
  const quoteMarkEntrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Attribution entrance
  const attrEntrance = spring({
    frame: frame - ATTR_START,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  // Word-by-word reveal
  const visibleWords = Math.min(
    WORDS.length,
    Math.max(0, Math.floor((frame - QUOTE_START) / FRAMES_PER_WORD))
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div
        style={{
          maxWidth: MAX_WIDTH,
          position: "relative",
        }}
      >
        {/* Opening quote mark */}
        <div
          style={{
            position: "absolute",
            top: -QUOTE_MARK_SIZE * 0.6,
            left: -20,
            fontSize: QUOTE_MARK_SIZE,
            fontFamily: "Georgia, serif",
            color: COLOR_QUOTE_MARK,
            lineHeight: 1,
            opacity: quoteMarkEntrance,
            transform: \`scale(\${interpolate(quoteMarkEntrance, [0, 1], [0.5, 1])})\`,
            userSelect: "none",
          }}
        >
          \u201C
        </div>

        {/* Quote text - word by word reveal */}
        <div
          style={{
            fontSize: QUOTE_FONT_SIZE,
            fontWeight: 400,
            fontFamily: "Georgia, serif",
            lineHeight: 1.6,
            color: COLOR_TEXT,
            letterSpacing: 0.3,
          }}
        >
          {WORDS.map((word, i) => {
            const wordFrame = QUOTE_START + i * FRAMES_PER_WORD;
            const wordProgress = spring({
              frame: frame - wordFrame,
              fps,
              config: { damping: 18, stiffness: 200 },
            });

            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: 8,
                  opacity: i < visibleWords ? wordProgress : 0,
                  transform: \`translateY(\${interpolate(
                    i < visibleWords ? wordProgress : 0,
                    [0, 1],
                    [8, 0]
                  )}px)\`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Closing quote mark */}
        <div
          style={{
            position: "absolute",
            bottom: -QUOTE_MARK_SIZE * 0.3,
            right: -10,
            fontSize: QUOTE_MARK_SIZE,
            fontFamily: "Georgia, serif",
            color: COLOR_QUOTE_MARK,
            lineHeight: 1,
            opacity: visibleWords >= WORDS.length ? quoteMarkEntrance : 0,
            userSelect: "none",
          }}
        >
          \u201D
        </div>

        {/* Attribution */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: attrEntrance,
            transform: \`translateY(\${interpolate(attrEntrance, [0, 1], [12, 0])}px)\`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 2,
              backgroundColor: COLOR_DASH,
            }}
          />
          <div
            style={{
              fontSize: ATTR_FONT_SIZE,
              fontFamily: "Inter, system-ui, sans-serif",
              color: COLOR_ATTRIBUTION,
              fontWeight: 500,
            }}
          >
            {ATTRIBUTION}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const quoteCardExample: DLMMediaExample = {
  id: "quote-card",
  name: "Quote Card",
  description: "Word-by-word quote reveal with decorative marks and attribution",
  category: "Text",
  durationInFrames: 150,
  fps: 30,
  code: quoteCardCode,
};
