import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateCsrfOrigin } from "@/lib/csrf";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/vault/delete
 * Deletes a file from Cloudinary using a server-side signed request.
 * This keeps the Cloudinary API secret server-side only.
 *
 * Body: { publicId: string, resourceType: "image" | "video" | "raw" }
 */
export async function POST(req: Request) {
  try {
    // 1. Auth check
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. CSRF protection
    if (!validateCsrfOrigin(req as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Parse request
    const { publicId, resourceType = "image" } = await req.json();
    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    // 4. Validate resource type
    if (!["image", "video", "raw"].includes(resourceType)) {
      return NextResponse.json({ error: "Invalid resourceType" }, { status: 400 });
    }

    // 5. Ownership check — verify the publicId belongs to this user in vault_items
    const adminClient = createAdminClient();
    const { data: vaultItem, error: ownerError } = await adminClient
      .from("vault_items")
      .select("id")
      .eq("public_id", publicId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownerError || !vaultItem) {
      return NextResponse.json(
        { error: "Asset not found or access denied" },
        { status: 403 }
      );
    }

    // 6. Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Cloudinary not configured — skip cloud delete but still clean up DB
      await adminClient.from("vault_items").delete().eq("id", vaultItem.id);
      return NextResponse.json({ skipped: true, reason: "Cloudinary not configured" });
    }

    // 7. Generate Cloudinary signature
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha256").update(stringToSign).digest("hex");

    // 8. Call Cloudinary Destroy API
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body: formData }
    );

    const result = await cloudRes.json();

    if (result.result === "ok" || result.result === "not found") {
      // 9. Delete the vault_items DB record
      await adminClient.from("vault_items").delete().eq("id", vaultItem.id);
      return NextResponse.json({ deleted: true, result: result.result });
    }

    console.error("[vault/delete] Cloudinary delete failed:", result);
    return NextResponse.json({ deleted: false, result }, { status: 500 });
  } catch (error: any) {
    console.error("[vault/delete] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
