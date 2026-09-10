import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/instagram/sync-comments
 *
 * Called client-side when the Comments page loads or user hits Refresh.
 * Fetches the 10 most recent Instagram media items for the authenticated user,
 * then upserts all comments into webhook_events using idempotency_key to
 * prevent duplicates. Works independently of Meta webhooks.
 *
 * NOTE: The client must call this with `credentials: "include"` so the
 * session cookie is forwarded and auth.getUser() succeeds.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch profile with Instagram credentials
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("instagram_token, instagram_id, instagram_connected")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.instagram_token || !profile?.instagram_id || !profile?.instagram_connected) {
    return NextResponse.json({ synced: 0, message: "Instagram not connected" }, { status: 200 });
  }

  let accessToken: string;
  try {
    accessToken = decrypt(profile.instagram_token);
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to decrypt token" }, { status: 500 });
  }

  const igUserId = profile.instagram_id;

  // We need admin client to upsert into webhook_events (bypasses RLS)
  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Fetch recent media
  const mediaRes = await fetch(
    `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,timestamp&limit=10&access_token=${accessToken}`
  );
  const mediaData = await mediaRes.json();
  console.log(`[sync-comments] Media fetch for ${igUserId}:`, JSON.stringify(mediaData));

  if (mediaData.error) {
    console.error("[sync-comments] Media fetch error:", mediaData.error.message);
    return NextResponse.json({ error: mediaData.error.message }, { status: 502 });
  }

  const mediaItems: { id: string; timestamp: string }[] = mediaData.data ?? [];
  let totalSynced = 0;

  // 4. For each media item, fetch and upsert comments
  for (const media of mediaItems) {
    try {
      const commentsRes = await fetch(
        `https://graph.instagram.com/v21.0/${media.id}/comments?fields=id,text,timestamp,username,from&limit=50&access_token=${accessToken}`
      );
      const commentsData = await commentsRes.json();

      if (commentsData.error) {
        console.error(`[sync-comments] Comments error for media ${media.id}:`, JSON.stringify(commentsData.error));
        continue;
      }

      const comments: any[] = commentsData.data ?? [];

      for (const comment of comments) {
        const { error: upsertErr } = await adminClient
          .from("webhook_events")
          .upsert(
            {
              event_type: "comment",
              instagram_media_id: media.id,
              instagram_object_id: comment.id,
              idempotency_key: comment.id,
              payload: {
                id: comment.id,
                text: comment.text,
                timestamp: comment.timestamp,
                from: { 
                  username: comment.username || comment.from?.username,
                  id: comment.from?.id 
                },
                media_id: media.id,
              },
              processed_at: comment.timestamp ?? new Date().toISOString(),
              user_id: user.id,
            },
            { onConflict: "idempotency_key", ignoreDuplicates: true }
          );

        if (!upsertErr) totalSynced++;
      }
    } catch (err: any) {
      console.warn(`[sync-comments] Skipped media ${media.id}:`, err.message);
    }
  }

  console.log(`[sync-comments] User ${user.id}: synced ${totalSynced} comments from ${mediaItems.length} media`);
  return NextResponse.json({ synced: totalSynced, mediaCount: mediaItems.length }, { status: 200 });
}
