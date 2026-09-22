import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

// Per-plan vault item limits
const VAULT_LIMITS: Record<string, number> = {
  free: 10,
  starter: 30,
  creator_pro: 100,
  survival_ai: 200,
  lifetime: 500,
};

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

    // 2. Plan vault limit check
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const userPlan = profile?.plan || "free";
    const vaultLimit = VAULT_LIMITS[userPlan] ?? 10;

    const { count: existingCount } = await adminClient
      .from("vault_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((existingCount ?? 0) >= vaultLimit) {
      return NextResponse.json(
        {
          error: `Vault limit reached. Your ${userPlan} plan allows up to ${vaultLimit} items. Upgrade your plan to add more.`,
        },
        { status: 403 }
      );
    }

    // 3. Cloudinary credentials — fail closed if not configured
    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    if (!CLOUDINARY_CLOUD) {
      console.error("[vault/upload] CLOUDINARY_CLOUD_NAME is not set");
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    // 4. Read form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 5. Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 6. MIME type validation
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

    // 7. File size validation — Vercel serverless cap is ~4.5MB for request bodies.
    // For larger files use direct Cloudinary signed uploads from the client.
    const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 4.5 MB server limit. Use direct upload for larger files." },
        { status: 413 }
      );
    }

    // 8. Forward to Cloudinary
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
