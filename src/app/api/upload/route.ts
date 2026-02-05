import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isVideo && !isImage) {
      return new Response(
        JSON.stringify({
          error: `Unsupported file type: ${file.type}. Allowed: ${[...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES].join(", ")}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await writeFile(filePath, uint8Array);

    // Return the public path (relative to public/ for staticFile())
    const uploadPath = `/uploads/${uniqueName}`;

    return new Response(
      JSON.stringify({
        uploadPath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        type: isVideo ? "video" : "image",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload file" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
