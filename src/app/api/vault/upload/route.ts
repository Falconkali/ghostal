import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Max file size: 100 MB
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

// Allowed MIME type prefixes
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
// Specific allowed types (no executables, SVGs with scripts, etc.)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/mpeg",
]);

// Cloudinary cloud name from environment (falls back to hardcoded only as last resort)
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "da8jrztp0";

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const serverClient = await createServerClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Read form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 3. Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 4. MIME type validation
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      const isPrefix = ALLOWED_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
      if (!isPrefix) {
        return NextResponse.json(
          {
            error: `File type '${mimeType}' is not allowed. Only images and videos are permitted.`,
          },
          { status: 415 }
        );
      }
    }

    // 5. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 100 MB limit." },
        { status: 413 }
      );
    }

    // 6. Forward to Cloudinary (upload preset scoped to user folder via preset config)
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await cloudRes.json();

    if (!cloudRes.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Cloudinary upload failed" },
        { status: cloudRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[vault/upload] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
