import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
  CompositionSettingsSchema,
  RenderSettingsSchema,
  AnimationStyleSchema,
  ContentDirectionSchema,
} from "@/types/wizard";

const SECTION_SCHEMAS: Record<string, z.ZodType> = {
  composition: CompositionSettingsSchema.partial(),
  render: RenderSettingsSchema.partial(),
  style: AnimationStyleSchema.partial(),
  content: ContentDirectionSchema.partial().extend({
    sceneDescription: z.string().optional(),
    textContent: z.string().optional(),
  }),
};

// Schema for "all" autofill - returns partial objects for each section
const AllSectionsSchema = z.object({
  composition: CompositionSettingsSchema.partial().optional(),
  render: RenderSettingsSchema.partial().optional(),
  style: AnimationStyleSchema.partial().optional(),
  content: ContentDirectionSchema.partial()
    .extend({
      textContent: z.string().optional(),
    })
    .optional(),
});

const SYSTEM_PROMPT = `You are an expert in Remotion video composition configuration.
Given a user's description of a video they want to create, suggest optimal configuration values.

Consider the following when making suggestions:
- For social media content: use appropriate aspect ratios (9:16 for stories/reels, 1:1 for posts, 16:9 for YouTube)
- For cinematic content: use 24fps, wider compositions
- Match the tone to appropriate color palettes, fonts, and pacing
- Duration should be appropriate for the content type (5-15s for social, 30-60s for explainers)
- Choose animation techniques that match the style (spring for playful, interpolate for data viz)
- Only suggest values that are different from defaults and add value for the specific prompt

Available color palettes should use hex colors. Font families should be from: Inter, Space Grotesk, Roboto, Montserrat, Playfair Display, JetBrains Mono, Poppins, Oswald (always include a fallback like "sans-serif" or "serif").

For the content section, you can suggest textContent (example copy to display in the animation) based on the scene description, and optionally refine the sceneDescription.
`;

interface AutofillRequest {
  prompt: string;
  section: string;
  currentConfig: Record<string, unknown>;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { prompt, section, currentConfig }: AutofillRequest = await req.json();

  if (!prompt && section !== "content") {
    return new Response(
      JSON.stringify({ error: "A scene description is required for autofill" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    if (section === "all") {
      const result = await generateObject({
        model: openai("gpt-5.2"),
        system: SYSTEM_PROMPT,
        prompt: `User wants to create: "${prompt}"

Current configuration: ${JSON.stringify(currentConfig, null, 2)}

Suggest optimal values for ALL sections (composition, render, style, content).
Only include fields where your suggestion differs from or improves upon the current config.
Do NOT include the sceneDescription in the content section (keep the user's original).`,
        schema: AllSectionsSchema,
      });

      return new Response(JSON.stringify(result.object), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const schema = SECTION_SCHEMAS[section];
    if (!schema) {
      return new Response(
        JSON.stringify({ error: `Unknown section: ${section}` }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const result = await generateObject({
      model: openai("gpt-5.2"),
      system: SYSTEM_PROMPT,
      prompt: `User wants to create: "${prompt}"

Current ${section} configuration: ${JSON.stringify(currentConfig[section] || {}, null, 2)}

Suggest optimal values for the "${section}" section only.
Only include fields where your suggestion differs from or improves upon the current config.${section === "content" ? "\nDo NOT change the sceneDescription - only suggest tone, category, and textContent." : ""}`,
      schema,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Autofill error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate autofill suggestions" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
