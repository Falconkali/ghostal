import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const serverClient = await createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Global rate limiting: 5 publishes per minute per user
    const allowed = await checkRateLimit("publish", user.id, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait before publishing again." }, { status: 429 });
    }

    // CSRF check
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    const body = await request.json();
    const { postId } = body;
    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the post belongs to the authenticated user (IDOR prevention)
    const { data: post, error: postError } = await supabase
      .from("scheduled_posts")
      .select("*, vault_item_id")
      .eq("id", postId)
      .eq("user_id", user.id) // <-- enforces ownership
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found or access denied" }, { status: 404 });
    }

    // Fetch Instagram credentials
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token, instagram_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instagram_token) {
      return NextResponse.json({ error: "No Instagram token configured" }, { status: 404 });
    }

    // Decrypt server-side — ENCRYPTION_KEY is server-only
    const accessToken = decrypt(profile.instagram_token);

    // Fetch media URL if vault item is linked
    let mediaUrl = "";
    if (post.vault_item_id) {
      const { data: vaultItem } = await supabase
        .from("vault_items")
        .select("media_url")
        .eq("id", post.vault_item_id)
        .single();
      if (vaultItem) mediaUrl = vaultItem.media_url || "";
    }

    // If no token/media, simulate success
    if (!accessToken || !profile.instagram_id || !mediaUrl) {
      await supabase.from("scheduled_posts").update({ status: "posted" }).eq("id", postId);
      return NextResponse.json({ success: true, simulated: true });
    }

    // Build container
    const containerParams: Record<string, string> = {
      caption: post.caption || "",
      access_token: accessToken,
    };
    if (post.type === "reel") {
      containerParams.media_type = "REELS";
      containerParams.video_url = mediaUrl;
    } else {
      containerParams.image_url = mediaUrl;
    }

    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${profile.instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(containerParams),
      }
    );
    const containerData = await containerRes.json();

    if (containerData.error) {
      const errMsg = containerData.error.message || "";
      await supabase.from("scheduled_posts").update({ status: "failed" }).eq("id", postId);
      return NextResponse.json(
        { error: `Container error: ${errMsg}` },
        { status: 400 }
      );
    }

    const creationId = containerData.id;

    // Poll container status
    let containerReady = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const statusRes = await fetch(
        `https://graph.instagram.com/v21.0/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === "FINISHED") {
        containerReady = true;
        break;
      }
      if (statusData.status_code === "ERROR") {
        break;
      }
    }

    if (!containerReady) {
      await supabase.from("scheduled_posts").update({ status: "failed" }).eq("id", postId);
      return NextResponse.json({ error: "Instagram container timed out" }, { status: 408 });
    }

    // Publish
    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${profile.instagram_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();

    if (publishData.error) {
      await supabase.from("scheduled_posts").update({ status: "failed" }).eq("id", postId);
      return NextResponse.json(
        { error: `Publish error: ${publishData.error.message}` },
        { status: 400 }
      );
    }

    await supabase.from("scheduled_posts").update({ status: "posted" }).eq("id", postId);
    return NextResponse.json({ success: true, simulated: false });
  } catch (err: any) {
    console.error("[instagram/publish] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
