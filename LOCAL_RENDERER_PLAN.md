# Remotion Local Renderer - Implementation Plan

## Overview

A hybrid cloud + local rendering architecture that gives users the choice between:
- **Cloud rendering** (AWS Lambda) - Fast, parallel, pay-per-use
- **Local rendering** (Desktop client) - Free, uses local CPU

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEB APP (Vercel)                                   │
│                     prompt-to-motion-graphics.vercel.app                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User opens web app → Generates animation with AI → Previews in browser    │
│                                                                              │
│   ┌─────────────────────────────┐    ┌─────────────────────────────────┐    │
│   │  "Render in Cloud" button   │    │  "Render Locally" button        │    │
│   │  → AWS Lambda               │    │  → Detects local client         │    │
│   │  → $0.01-0.02 per video     │    │  → Sends to localhost:3200      │    │
│   │  → Fast (parallel render)   │    │  → FREE, uses your CPU          │    │
│   └─────────────────────────────┘    └──────────────┬──────────────────┘    │
│                                                      │                       │
└──────────────────────────────────────────────────────┼───────────────────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LOCAL RENDER CLIENT (Desktop App)                         │
│                         ~85MB download                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│   │  Local API   │    │ Remotion CLI │    │  FFmpeg (bundled)            │  │
│   │  :3200       │ →  │  renderer    │ →  │  Outputs MP4 to Downloads    │  │
│   └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│                                                                              │
│   Runs in system tray • Auto-starts • Shows render progress                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User Flow

### Cloud User (no install required)
```
Open web → Create animation → Click "Render in Cloud" → Download from AWS
```

### Local User (with client installed)
```
Install client once → Open web → Create animation → Click "Render Locally" → Video in Downloads
```

---

## Comparison

| Feature | Cloud (AWS Lambda) | Local (Desktop Client) |
|---------|-------------------|------------------------|
| Cost | ~$0.01-0.02 per video | Free |
| Speed | Fast (parallel) | Depends on CPU |
| Setup | None | One-time install |
| Internet | Required | Only for AI generation |
| Best for | Production, high volume | Development, personal use |

---

## Local Client Specifications

### Bundled Components

| Component | Size | Purpose |
|-----------|------|---------|
| Electron shell | ~30MB | Desktop app framework |
| Remotion CLI | ~15MB | Video rendering engine |
| FFmpeg | ~40MB | Video encoding |
| **Total** | **~85MB** | One-click installer |

### System Requirements

- **OS**: macOS 10.15+, Windows 10+, Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: Any modern processor (rendering speed scales with cores)
- **Disk**: 500MB free space

### API Endpoints

The local client exposes these endpoints on `localhost:3200`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check if client is running |
| `/render` | POST | Start a render job |
| `/progress/:jobId` | GET | Get render progress |
| `/cancel/:jobId` | POST | Cancel a render |

### Client UI Features

```
┌────────────────────────────────────────┐
│  🎬 Remotion Local Renderer      — □ ✕ │
├────────────────────────────────────────┤
│                                        │
│  Status: ● Running on port 3200        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Current Render:                  │  │
│  │ "Hello World Animation"          │  │
│  │ ████████████░░░░░░░░ 58%         │  │
│  │ ETA: 12 seconds                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Recent Renders:                       │
│  ✓ bar-chart.mp4 (2 min ago)          │
│  ✓ typewriter.mp4 (5 min ago)         │
│                                        │
│  [Open Downloads Folder]               │
│                                        │
└────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Local Render API
**Estimated time: 1-2 hours**

Add local rendering support to existing Next.js app:

- [ ] Create `/api/render-local/route.ts` endpoint
- [ ] Detect environment (Vercel vs local)
- [ ] Implement Remotion CLI rendering via child process
- [ ] Add progress tracking via Server-Sent Events
- [ ] Save output to user-specified directory

```typescript
// Pseudo-code for local render API
POST /api/render-local
{
  "code": "export const MyAnimation = () => { ... }",
  "settings": {
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "durationInFrames": 150
  }
}

Response (SSE stream):
data: {"progress": 0.25, "frame": 38, "totalFrames": 150}
data: {"progress": 0.50, "frame": 75, "totalFrames": 150}
data: {"progress": 1.0, "outputPath": "/Users/xxx/Downloads/video.mp4"}
```

### Phase 2: Standalone Electron Client
**Estimated time: 4-6 hours**

Create a lightweight desktop app:

- [ ] Initialize Electron project
- [ ] Bundle Remotion CLI dependencies
- [ ] Bundle FFmpeg binaries (platform-specific)
- [ ] Implement system tray functionality
- [ ] Create render queue UI
- [ ] Add auto-start on login option
- [ ] Package for macOS, Windows, Linux

### Phase 3: Web App Integration
**Estimated time: 1-2 hours**

Update web app to detect and use local client:

- [ ] Add local client detection (`localhost:3200/health`)
- [ ] Show "Render Locally" button when client detected
- [ ] Implement render request to local client
- [ ] Show progress in web UI
- [ ] Handle errors gracefully (client offline, render failed)

### Phase 4: Polish & Distribution
**Estimated time: 2-4 hours**

- [ ] Code signing for macOS/Windows
- [ ] Auto-update mechanism
- [ ] Create installer packages (.dmg, .exe, .AppImage)
- [ ] Write user documentation
- [ ] Create download page on website

---

## Technical Details

### Local Render Process

```javascript
// Inside Electron client
const { execSync, spawn } = require('child_process');
const path = require('path');

async function renderVideo(code, settings) {
  // 1. Write component code to temp file
  const tempDir = os.tmpdir();
  const componentPath = path.join(tempDir, 'DynamicComponent.tsx');
  fs.writeFileSync(componentPath, code);
  
  // 2. Run Remotion CLI render
  const process = spawn('npx', [
    'remotion', 'render',
    componentPath,
    'MyAnimation',
    '--output', outputPath,
    '--fps', settings.fps,
    '--width', settings.width,
    '--height', settings.height,
  ]);
  
  // 3. Stream progress back
  process.stderr.on('data', (data) => {
    const progress = parseProgress(data.toString());
    sendProgressUpdate(progress);
  });
  
  // 4. Return output path when done
  return outputPath;
}
```

### Web App Detection Logic

```typescript
// In web app
async function detectLocalClient(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3200/health', {
      signal: AbortSignal.timeout(1000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

// In render button component
const [hasLocalClient, setHasLocalClient] = useState(false);

useEffect(() => {
  detectLocalClient().then(setHasLocalClient);
}, []);

// Show appropriate button
{hasLocalClient ? (
  <Button onClick={renderLocally}>Render Locally (Free)</Button>
) : (
  <Button onClick={renderCloud}>Render in Cloud</Button>
)}
```

---

## File Structure

```
remotion-local-client/
├── package.json
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script
│   ├── tray.ts              # System tray logic
│   └── renderer/
│       ├── index.html       # Client UI
│       └── app.tsx          # React UI
├── server/
│   ├── api.ts               # Express server on :3200
│   ├── render.ts            # Remotion render logic
│   └── progress.ts          # Progress tracking
├── bin/
│   ├── ffmpeg-mac           # Bundled FFmpeg (macOS)
│   ├── ffmpeg-win.exe       # Bundled FFmpeg (Windows)
│   └── ffmpeg-linux         # Bundled FFmpeg (Linux)
└── build/
    ├── icon.icns            # macOS icon
    ├── icon.ico             # Windows icon
    └── icon.png             # Linux icon
```

---

## Distribution

### Download Sizes

| Platform | Format | Size |
|----------|--------|------|
| macOS | `.dmg` | ~85MB |
| Windows | `.exe` installer | ~90MB |
| Linux | `.AppImage` | ~85MB |

### Update Strategy

- Use `electron-updater` for auto-updates
- Check for updates on app start
- Download in background, prompt to restart

---

## Future Enhancements

- [ ] Render queue (multiple videos)
- [ ] Preset output settings (4K, 1080p, vertical, etc.)
- [ ] Batch rendering from folder
- [ ] Integration with local AI (Ollama) for fully offline use
- [ ] GPU acceleration support

---

## References

- [Remotion CLI Documentation](https://www.remotion.dev/docs/cli)
- [Electron Documentation](https://www.electronjs.org/docs)
- [FFmpeg Static Builds](https://ffmpeg.org/download.html)
