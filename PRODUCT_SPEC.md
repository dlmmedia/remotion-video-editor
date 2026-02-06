# Video Agent — Product Specification

**Product Name:** Video Agent by DLM Media
**Version:** 1.0.0
**Last Updated:** February 6, 2026

---

## 1. Product Overview

Video Agent is an AI-powered motion graphics studio that transforms natural language descriptions into fully rendered, exportable video animations. Users describe what they want to see — "an animated bar chart showing quarterly revenue" or "a WhatsApp-style chat conversation with bouncing bubbles" — and the system generates production-ready Remotion code, previews it in real time, and renders it to MP4, WebM, ProRes, or GIF.

The product targets content creators, marketers, designers, and developers who need programmatic motion graphics without learning animation frameworks. It combines a conversational AI interface, a live code editor, and a real-time video preview into a single workspace.

---

## 2. Core Value Proposition

- **Prompt-to-Video:** Users go from a text description to a rendered video in under 60 seconds.
- **Iterative Refinement:** A chat-based conversation lets users request changes ("make the background darker", "add a bouncing logo in the corner") without starting over.
- **Full Code Access:** Every animation is backed by real React/Remotion code visible in a Monaco editor. Power users can hand-edit at any time.
- **Production Export:** Videos render via AWS Lambda with full codec control (H.264, H.265, VP8/VP9, ProRes, GIF) at up to 4K resolution, 60fps.
- **Project Persistence:** All work is saved to a cloud database, accessible across sessions. Projects store code, conversation history, and render settings.

---

## 3. User Experience Flow

### 3.1 Landing Page

The landing page serves two modes:

1. **Quick Start** — A single text input where a user types a prompt (e.g., "Create an animated countdown timer with neon colors"). Pressing Enter creates a new project and navigates directly to the editor.
2. **Prompt Wizard** — A multi-section configuration panel that lets users precisely define their video before generation. Sections include content description, composition settings (resolution/fps/duration), animation style (technique/pacing/colors/fonts), render settings (codec/quality), and reference media uploads.

A sidebar on the left lists all saved projects with search, filter (All / Starred / Recent), rename, delete, and star functionality.

### 3.2 Editor Workspace (`/generate`)

The main workspace is a three-panel layout:

| Panel | Purpose |
|-------|---------|
| **Code Editor** (left) | Monaco-based editor with JSX/TypeScript syntax highlighting, custom dark theme, real-time error markers, and streaming mode that shows AI-generated code as it arrives |
| **Animation Preview** (center) | Remotion Player rendering the compiled code in real time with play/pause, scrubbing, and frame-level control |
| **Chat Sidebar** (right) | Conversation history showing user prompts, assistant responses with metadata (skills used, edit type), and error messages. Includes media attachment support and model selection |

### 3.3 Generation Cycle

```
User sends prompt
    ↓
Prompt validated (reject non-visual requests)
    ↓
Skills detected (match prompt to domain expertise)
    ↓
AI generates code (streaming for new, structured for edits)
    ↓
Code sanitized (strip markdown, extract component)
    ↓
Babel compiles in-browser
    ↓
Remotion Player renders preview
    ↓
Project auto-saved to database
```

### 3.4 Iterative Editing

After initial generation, users continue the conversation. The system intelligently decides between:

- **Targeted Edits** — Small changes (colors, text, timing) are applied as search-replace operations on the existing code, preserving everything else.
- **Full Replacement** — Major restructuring replaces the entire component.

If an edit fails (ambiguous match, text not found), the system enters a self-healing loop that retries with more context, up to a configurable max attempts.

### 3.5 Rendering & Export

Users click "Render & Download" to export. The system:

1. Sends composition props (code, duration, fps) and render options to AWS Lambda
2. Lambda renders the Remotion composition frame-by-frame
3. Frontend polls for progress (1.5s interval) with a visual progress bar
4. On completion, provides a download link

Supported export formats:
- **H.264 / H.265** (.mp4)
- **VP8 / VP9** (.webm)
- **ProRes** (.mov) — with profile selection (Proxy through 4444 XQ)
- **GIF** — for social media loops

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 16 (App Router) | Server-side rendering, API routes, file-based routing |
| UI Library | React 19 | Component rendering |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Video Engine | Remotion 4 | Programmatic video composition, rendering |
| Code Editor | Monaco Editor | In-browser code editing with IntelliSense |
| AI Provider | OpenAI (via Vercel AI SDK) | Code generation, prompt validation, skill detection |
| Database | Neon (Serverless PostgreSQL 17) | Project persistence |
| File Storage | Local filesystem (`public/uploads/`) | Media file uploads |
| Cloud Rendering | AWS Lambda (via Remotion Lambda) | Server-side video rendering |
| 3D Graphics | Three.js + React Three Fiber | 3D animation support |
| Validation | Zod | Schema validation throughout |
| Deployment | Vercel | Hosting and serverless functions |

### 4.2 Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Landing page (quick start + wizard)
│   ├── generate/page.tsx     # Main editor workspace
│   ├── api/
│   │   ├── generate/         # AI code generation endpoint
│   │   ├── projects/         # Project CRUD endpoints
│   │   ├── upload/           # Media file upload endpoint
│   │   ├── wizard/autofill/  # AI-powered wizard config suggestions
│   │   └── lambda/           # Remotion Lambda render + progress
│   └── layout.tsx            # Root layout
├── components/
│   ├── AnimationPlayer/      # Remotion Player wrapper + render controls
│   ├── ChatSidebar/          # Conversation UI + input + attachments
│   ├── CodeEditor/           # Monaco editor wrapper + streaming overlay
│   ├── PromptWizard/         # Multi-section configuration wizard
│   └── ProjectsSidebar.tsx   # Project list management
├── hooks/
│   ├── useAnimationState.ts  # Code compilation state management
│   ├── useGenerationApi.ts   # AI generation request handling
│   ├── useConversationState.ts # Chat message state management
│   ├── useProjects.ts        # Project CRUD + auto-save
│   ├── useWizardState.ts     # Wizard config state + autofill
│   └── useAutoCorrection.ts  # Self-healing error correction loop
├── helpers/
│   ├── prompt-assembler.ts   # Wizard config → structured prompt
│   ├── sanitize-response.ts  # Strip markdown, validate, extract code
│   ├── capture-frame.ts      # Capture preview frame for AI context
│   ├── use-rendering.ts      # Lambda render state machine
│   └── api-response.ts       # Generic API response handler
├── remotion/
│   ├── compiler.ts           # Babel in-browser compilation
│   ├── DynamicComp.tsx       # Runtime component renderer
│   ├── Root.tsx              # Remotion composition root
│   └── index.ts              # Remotion entry point
├── skills/                   # AI skill modules (see §5)
├── examples/                 # Example prompts and code references
├── lib/
│   ├── db.ts                 # Neon database connection
│   └── project-storage.ts    # Project data access layer
└── types/                    # TypeScript type definitions
```

### 4.3 In-Browser Compilation Pipeline

The system compiles generated React/Remotion code entirely in the browser:

1. **Strip Imports** — All `import` statements are removed. Dependencies are injected at runtime.
2. **Wrap Component** — The code is wrapped in a module factory function.
3. **Babel Transpile** — `@babel/standalone` transpiles JSX and TypeScript to plain JavaScript.
4. **Dependency Injection** — A runtime scope provides all Remotion APIs (`useCurrentFrame`, `spring`, `interpolate`, `AbsoluteFill`, `Sequence`, etc.), React hooks, Three.js, and Remotion packages.
5. **Component Extraction** — The first exported component is extracted and returned.
6. **Error Capture** — Compilation errors are caught and surfaced to the UI and self-healing system.

### 4.4 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/generate` | Generate or edit Remotion code via AI |
| `GET` | `/api/projects` | List all projects (summaries) |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get full project data |
| `PATCH` | `/api/projects/:id` | Update project (partial) |
| `POST` | `/api/projects/:id` | Update project (for sendBeacon on unmount) |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `POST` | `/api/upload` | Upload image or video file |
| `POST` | `/api/wizard/autofill` | AI-powered wizard section suggestions |
| `POST` | `/api/lambda/render` | Start Lambda render job |
| `POST` | `/api/lambda/progress` | Poll render progress |

---

## 5. AI System

### 5.1 Models

The system uses OpenAI GPT-5.2 with configurable reasoning effort levels:

| Model ID | Description |
|----------|-------------|
| `gpt-5.2:none` | GPT-5.2 — No reasoning (fastest) |
| `gpt-5.2:low` | GPT-5.2 — Low reasoning (default) |
| `gpt-5.2:medium` | GPT-5.2 — Medium reasoning |
| `gpt-5.2:high` | GPT-5.2 — High reasoning |
| `gpt-5.2-pro:medium` | GPT-5.2 Pro — Medium reasoning |
| `gpt-5.2-pro:high` | GPT-5.2 Pro — High reasoning |
| `gpt-5.2-pro:xhigh` | GPT-5.2 Pro — Extra-high reasoning |

### 5.2 Generation Pipeline

**Initial Generation (streaming):**
1. **Validation** — A lightweight `generateObject` call classifies the prompt as valid/invalid for motion graphics. Invalid prompts (questions, text requests, non-visual tasks) are rejected before the expensive generation call.
2. **Skill Detection** — A second `generateObject` call identifies which domain skills apply to the prompt.
3. **Code Generation** — `streamText` generates the Remotion component with the base system prompt enhanced by detected skill content. The stream is sent to the client as SSE, with metadata (skills) prepended.

**Follow-up Edits (non-streaming):**
1. **Skill Detection** — Same as above, but previously-used skills are filtered out to avoid redundant context.
2. **Edit Decision** — `generateObject` with a structured schema decides between targeted edits or full replacement.
3. **Edit Application** — For targeted edits, search-replace operations are applied server-side with validation (exact match, no ambiguity). Failed edits return error details for the self-healing loop.

### 5.3 Self-Healing Error Correction

When generated code fails to compile, the system automatically:

1. Captures the error message and failed edit details
2. Sends them back to the AI with an error correction prompt
3. The AI generates a fix (targeted edit or full replacement)
4. Repeats up to a configurable max attempts

This handles common issues like syntax errors, undefined variables, and ambiguous edit targets.

### 5.4 Skills System

Skills are modular knowledge units that provide domain-specific guidance without bloating every prompt. They are dynamically injected based on prompt analysis.

#### Guidance Skills (Pattern Libraries)

| Skill | Domain | Key Patterns |
|-------|--------|-------------|
| `charts` | Data visualization | Staggered bar animations, axis labels, pie charts with stroke-dashoffset |
| `typography` | Text animation | Typewriter effects (string slicing), word carousels, text highlights with crossfade |
| `messaging` | Chat UIs | Bubble layouts, staggered entrances, WhatsApp/iMessage themes |
| `transitions` | Scene changes | TransitionSeries, fade/slide/wipe/flip effects, linear and spring timing |
| `sequencing` | Timing control | Sequence delays, Series for sequential playback, staggered elements |
| `spring-physics` | Organic motion | Spring config presets (snappy/bouncy/smooth/heavy), chained springs |
| `social-media` | Platform formats | Safe zones, mobile-first sizing (48px min), loop-friendly endings |
| `3d` | Three.js scenes | ThreeCanvas setup, lighting, camera positioning, frame-based rotation |

#### Example Skills (Code References)

16 complete working examples that serve as implementation archetypes:

| Example | Category | Description |
|---------|----------|-------------|
| `animated-shapes` | Shapes & Motion | Animated geometric shapes |
| `audio-waveform` | Audio | Audio waveform visualization |
| `countdown` | Timer | Countdown timer animation |
| `falling-spheres` | Physics | Falling sphere simulation |
| `gold-price-chart` | Data Viz | Animated gold price histogram |
| `histogram` | Data Viz | Generic histogram animation |
| `lottie-animation` | Integration | Lottie file playback |
| `music-player` | UI | Music player interface |
| `podcast-card` | UI | Podcast card animation |
| `progress-bar` | UI | Progress bar animation |
| `quote-card` | Typography | Quote card with text animation |
| `spectrum-circle` | Audio | Circular spectrum visualizer |
| `text-rotation` | Typography | Rotating text animation |
| `typewriter-highlight` | Typography | Typewriter with highlight effect |
| `vinyl-record` | 3D/Motion | Spinning vinyl record |
| `word-carousel` | Typography | Word carousel animation |

### 5.5 Prompt Wizard & Autofill

The Prompt Wizard assembles a structured prompt from user-configured settings. The AI autofill feature can populate any section or all sections based on a scene description.

**Wizard Sections:**

1. **Content Direction** — Scene description, tone (professional/playful/dramatic/minimal/bold/elegant/techy), category (social-media/product-showcase/data-viz/explainer/title-sequence/logo-animation/kinetic-typography/abstract/countdown/infographic), and text content
2. **Composition Settings** — Resolution presets (1080p, 4K, Instagram Story, YouTube Shorts, Twitter/X Post, etc.), FPS (24/25/30/60), duration in frames, background color
3. **Animation Style** — Technique (spring/interpolate/mixed), pacing (slow/medium/fast), color palette (8 presets or custom), font family (8 options), font weight, transition type (fade/slide/wipe/none)
4. **Render Settings** — Codec (H.264/H.265/VP8/VP9/ProRes/GIF), CRF, bitrate, pixel format, image format, JPEG quality, ProRes profile
5. **Reference Media** — Image and video uploads with role assignment (style-reference/content-to-include/background/overlay)
6. **Model Selection** — Choose from the available GPT-5.2 model variants

### 5.6 Visual Context (Frame Capture)

Users can attach visual context to their prompts:

- **Frame Capture** — Captures the current preview frame at 0.5x scale (960x540) and sends it as a base64 image to the AI for visual reference
- **Image Upload** — Drag-and-drop or file picker for reference images (up to 4, max 10MB each)
- **Video Upload** — Upload video files for inclusion in compositions (up to 4, max 50MB each)
- **Clipboard Paste** — Paste images directly from clipboard

---

## 6. Database Schema

### 6.1 Infrastructure

- **Provider:** Neon (Serverless PostgreSQL 17)
- **Region:** AWS US West 2 (Oregon)
- **Connection:** HTTP-based one-shot queries via `@neondatabase/serverless` (no persistent connection pool)
- **Compute:** 0.25 CU autoscaling
- **Storage Limit:** 512 MB per branch

### 6.2 Tables

#### `projects` (Single Table Design)

The entire application state is stored in a single `projects` table. Each project encapsulates the code, conversation history, render settings, and metadata.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `text` | NOT NULL | — | Primary key. Format: `proj_{timestamp}_{random7}` (e.g., `proj_1706123456789_a3b9x2k`) |
| `name` | `text` | NOT NULL | `'Untitled Project'` | User-facing project name |
| `code` | `text` | NOT NULL | `''` | Current Remotion component code (full React/JSX source) |
| `prompt` | `text` | NOT NULL | `''` | The initial prompt that created this project |
| `messages` | `jsonb` | NOT NULL | `'[]'` | Full conversation history (see §6.3) |
| `status` | `text` | NOT NULL | `'draft'` | Project lifecycle state. Constrained to: `draft`, `rendering`, `complete` |
| `starred` | `boolean` | NOT NULL | `false` | Whether the user has favorited this project |
| `duration_in_frames` | `integer` | NOT NULL | `150` | Video length in frames |
| `fps` | `integer` | NOT NULL | `30` | Frames per second |
| `model` | `text` | NOT NULL | `'gpt-5.2:low'` | AI model used for generation |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Last modification timestamp (updated on every save) |

#### Indexes

| Index | Type | Definition | Purpose |
|-------|------|-----------|---------|
| `projects_pkey` | Unique (B-tree) | `(id)` | Primary key lookup |
| `idx_projects_updated_at` | B-tree | `(updated_at DESC)` | Efficient ordering for project list (most recent first) |
| `idx_projects_starred` | Partial B-tree | `(starred) WHERE starred = true` | Fast filtering for starred projects |

#### Constraints

| Constraint | Type | Rule |
|-----------|------|------|
| `projects_pkey` | PRIMARY KEY | `id` is unique and not null |
| `projects_status_check` | CHECK | `status IN ('draft', 'rendering', 'complete')` |

### 6.3 Messages JSONB Structure

The `messages` column stores the full conversation history as a JSONB array. Each message follows this structure:

```json
{
  "id": "user-1706123456789",
  "role": "user | assistant | error",
  "content": "Make the background gradient purple to blue",
  "timestamp": 1706123456789,

  // User messages only:
  "attachedImages": ["data:image/png;base64,..."],

  // Assistant messages only:
  "codeSnapshot": "import { useCurrentFrame... } ...",
  "metadata": {
    "skills": ["spring-physics", "typography"],
    "editType": "tool_edit | full_replacement",
    "edits": [
      {
        "description": "Changed background color",
        "old_string": "backgroundColor: '#000'",
        "new_string": "backgroundColor: '#1a0033'",
        "lineNumber": 15
      }
    ],
    "model": "gpt-5.2"
  },

  // Error messages only:
  "errorType": "edit_failed | api | validation",
  "failedEdit": {
    "description": "Update background color",
    "old_string": "...",
    "new_string": "..."
  }
}
```

### 6.4 Data Flow & Auto-Save

- **Debounced Auto-Save:** The frontend auto-saves project state every 2 seconds (debounced) via `PATCH /api/projects/:id`
- **Unmount Save:** On page unload, `navigator.sendBeacon()` fires a final save to prevent data loss
- **Save Payload:** Includes code, messages, name, duration, fps, and model — only changed fields are sent
- **Optimistic Updates:** Project list updates locally before server confirmation for instant UI feedback

---

## 7. Media Handling

### 7.1 Upload Pipeline

```
User selects file → Client validates type/size → FormData POST to /api/upload
    → Server validates → Writes to public/uploads/{uuid}.{ext}
    → Returns upload path → Client stores path in wizard config
    → Generated code uses staticFile("/uploads/{uuid}.{ext}")
```

### 7.2 Supported Formats

| Type | Allowed MIME Types | Max Size |
|------|-------------------|----------|
| Image | JPEG, PNG, GIF, WebP | 10 MB |
| Video | MP4, WebM, QuickTime | 50 MB |

### 7.3 Media Roles

Uploaded media can be assigned roles that inform the AI how to use them:

- **Style Reference** — Visual inspiration for the animation style
- **Content to Include** — Assets that should appear in the video
- **Background** — Full-frame background media
- **Overlay** — Layered on top of other content

---

## 8. Rendering Pipeline

### 8.1 Local Preview

The Remotion Player renders in-browser using the compiled component. It supports:
- Real-time playback with play/pause/scrub
- Runtime error catching with error boundary
- Loading states during compilation
- Responsive sizing within the editor layout

### 8.2 Cloud Rendering (AWS Lambda)

| Setting | Value |
|---------|-------|
| Region | `us-east-1` |
| RAM | 3,008 MB |
| Disk | 10,240 MB |
| Timeout | 240 seconds |
| Frames per Lambda | 60 |

**Render Flow:**
1. Client sends composition props + render options to `/api/lambda/render`
2. Server invokes `renderMediaOnLambda()` with the configured function name
3. Client polls `/api/lambda/progress` every 1.5 seconds
4. States: `invoking` → `rendering` (with progress %) → `done` (with download URL) | `error`
5. Max render time: 5 minutes (client-side timeout)
6. Max consecutive poll failures before abort: 5

### 8.3 Export Configuration

| Option | Values | Default |
|--------|--------|---------|
| Codec | H.264, H.265, VP8, VP9, ProRes, GIF | H.264 |
| Pixel Format | YUV 4:2:0, YUV 4:4:4 | YUV 4:2:0 |
| Image Format | JPEG, PNG | JPEG |
| JPEG Quality | 0–100 | 80 |
| CRF | 0–63 | (codec default) |
| Video Bitrate | String (e.g., "5M") | (codec default) |
| ProRes Profile | Proxy, Light, Standard, HQ, 4444, 4444 XQ | — |

---

## 9. Resolution Presets

| Preset | Width | Height | Use Case |
|--------|-------|--------|----------|
| Landscape 1080p | 1920 | 1080 | YouTube, presentations |
| Portrait 1080p | 1080 | 1920 | Mobile content |
| Square | 1080 | 1080 | Instagram posts |
| 4K Landscape | 3840 | 2160 | High-end production |
| 4K Portrait | 2160 | 3840 | High-end mobile |
| 720p Landscape | 1280 | 720 | Lightweight web |
| Instagram Story | 1080 | 1920 | Instagram/Snapchat |
| YouTube Shorts | 1080 | 1920 | YouTube Shorts |
| Twitter/X Post | 1200 | 675 | Twitter/X feed |

---

## 10. Environment & Configuration

### 10.1 Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API access for code generation, validation, and skill detection |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `REMOTION_AWS_ACCESS_KEY_ID` | AWS credentials for Lambda rendering |
| `REMOTION_AWS_SECRET_ACCESS_KEY` | AWS credentials for Lambda rendering |

### 10.2 Optional Environment Variables

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage for media uploads (alternative to local filesystem) |

### 10.3 Deployment

- **Platform:** Vercel
- **Build Command:** `node deploy.mjs && next build` (deploys Remotion Lambda bundle, then builds Next.js)
- **Max API Duration:** 60 seconds (for AI generation and Lambda invocation)

---

## 11. Design System

### 11.1 Visual Language

- **Theme:** Dark mode with deep navy/black backgrounds
- **Accent Colors:** Violet (`#7C3AED`) and cyan (`#06B6D4`) gradient pairing
- **Typography:**
  - UI: Inter (sans-serif)
  - Headings: Space Grotesk (sans-serif)
  - Code: JetBrains Mono (monospace)
- **Editor Theme:** Custom dark Monaco theme with violet-tinted selections and muted syntax colors

### 11.2 Component Patterns

- **Collapsible Panels** — Sidebars and wizard sections collapse with smooth transitions
- **Streaming UI** — Code appears character-by-character during generation with syntax highlighting disabled to prevent flicker
- **Skeleton States** — Loading placeholders for project list and preview
- **Toast-Free Errors** — Errors appear inline in the chat sidebar as error-type messages with specific error context
- **Auto-Scroll** — Chat scrolls to latest message automatically

---

## 12. Content Categories

The system is optimized for generating the following types of motion graphics:

| Category | Description | Example Prompts |
|----------|-------------|-----------------|
| Social Media Content | Platform-optimized clips | "Instagram story announcing a sale with countdown" |
| Product Showcase | Product demos and features | "Showcase an iPhone with 3 feature callouts" |
| Data Visualization | Charts, graphs, infographics | "Bar chart showing quarterly revenue with staggered animation" |
| Explainer Animation | Educational content | "Step-by-step animation of how OAuth works" |
| Title Sequence / Intro | Video intros and outros | "Cinematic title reveal with particle effects" |
| Logo Animation | Brand identity motion | "Logo bounce-in with tagline typewriter" |
| Kinetic Typography | Text-driven animation | "Motivational quote with word-by-word reveal" |
| Abstract Motion | Decorative graphics | "Flowing gradient waves with floating particles" |
| Countdown / Timer | Time-based content | "New Year countdown with fireworks at zero" |
| Animated Infographic | Data storytelling | "World map showing data center locations" |

---

## 13. Code Generation Constraints

The AI follows strict conventions when generating Remotion code:

### 13.1 Component Structure
1. ES6 imports at the top
2. Named export: `export const MyAnimation = () => { ... };`
3. Inside the component body (in order):
   - Multi-line comment describing the animation
   - Hooks (`useCurrentFrame`, `useVideoConfig`)
   - Constants in `UPPER_SNAKE_CASE` (colors, text, timing, layout)
   - Calculations and derived values
   - Return JSX

### 13.2 Constants-First Design
All customizable values are declared as named constants inside the component:
```tsx
const COLOR_PRIMARY = "#7C3AED";
const TITLE_TEXT = "Hello World";
const FADE_DURATION = 20;
const PADDING = 40;
```
This makes it trivial for users to customize without understanding animation logic.

### 13.3 Animation Preferences
- **Spring physics** preferred over linear interpolation for organic feel
- **Stagger delays** for multi-element entrances
- **Clamped extrapolation** always applied (`extrapolateLeft: "clamp", extrapolateRight: "clamp"`)
- **No background fade-in** — backgrounds are set from frame 0

### 13.4 Available Remotion APIs
The compiler injects these at runtime:
- Core: `useCurrentFrame`, `useVideoConfig`, `AbsoluteFill`, `interpolate`, `spring`, `Sequence`, `Video`, `OffthreadVideo`, `staticFile`, `Audio`
- Transitions: `TransitionSeries`, `linearTiming`, `springTiming`, `fade`, `slide`
- Shapes: `Circle`, `Rect`, `Triangle`, `Star`, `Ellipse`, `Pie`
- 3D: `ThreeCanvas`
- React: `useState`, `useEffect`, `useMemo`

---

## 14. Limitations & Constraints

| Constraint | Detail |
|-----------|--------|
| No direct image upload to AI | Images are referenced via URL in generated code using `<Img>` component |
| Single-user model | No authentication, multi-tenancy, or access control |
| Local file uploads | Media files stored on local/server filesystem (not CDN-backed by default) |
| Client-side compilation | All code compiles in the browser via Babel — no server-side sandboxing |
| No audio generation | AI cannot generate audio; users must reference existing audio files |
| Code-only output | AI generates code, not visual templates — requires React/Remotion runtime |
| Lambda cold starts | First render in a session may take longer due to AWS Lambda cold start |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **Remotion** | Open-source React framework for creating videos programmatically |
| **Composition** | A Remotion video definition with width, height, fps, and duration |
| **Frame** | A single rendered image in the video timeline; frame 0 is the first visible frame |
| **Spring** | Remotion's physics-based animation function that produces natural motion |
| **Interpolate** | Remotion's linear mapping function for progress-based animations |
| **Skill** | A modular knowledge unit (markdown or code) injected into the AI prompt based on detected domain |
| **Edit Operation** | A search-replace pair (`old_string` → `new_string`) applied to existing code |
| **Self-Healing** | Automatic retry loop that sends compilation errors back to the AI for correction |
| **Prompt Wizard** | Multi-section UI for configuring video parameters before generation |
| **Autofill** | AI-powered suggestion system that populates wizard fields from a scene description |

---
