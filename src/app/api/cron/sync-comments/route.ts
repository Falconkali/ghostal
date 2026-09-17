import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/cron/sync-comments
 *
 * Polling fallback for Instagram comment sync.
 * Fetches the last 10 media items for every connected Instagram account,
 * then fetches comments on each, and upserts them into webhook_events.
 * This guarantees comments appear even when Meta webhooks are unreliable.
 *
 * Run every 5 minutes via Vercel Cron (vercel.json).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const adminClient = createAdminClient();

  // 1. Get all connected profiles that have a token
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, instagram_id, instagram_token")
    .eq("instagram_connected", true)
    .not("instagram_token", "is", null)
    .not("instagram_id", "is", null);

  if (error || !profiles?.length) {
    return NextResponse.json({ message: "No connected profiles", error }, { status: 200 });
  }

  const results: any[] = [];
  const BATCH_SIZE = 3; // process 3 profiles at a time

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (profile) => {
        try {
          const accessToken = decrypt(profile.instagram_token!);
          const igUserId = profile.instagram_id!;
          const userId = profile.id;

          // 2. Fetch the last 10 media items
          const mediaRes = await fetch(
            `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,timestamp&limit=10&access_token=${accessToken}`
          );
          const mediaData = await mediaRes.json();

          if (mediaData.error) {
            console.error(`[sync-comments] Media fetch error for user ${userId}:`, mediaData.error.message);
            results.push({ userId, error: mediaData.error.message });
            return;
          }

          const mediaItems: { id: string; timestamp: string }[] = mediaData.data ?? [];
          let totalUpserted = 0;

          // 3. Fetch comments for all media items in parallel
          const commentResults = await Promise.allSettled(
            mediaItems.map(async (media) => {
              const commentsRes = await fetch(
                `https://graph.instagram.com/v21.0/${media.id}/comments?fields=id,text,timestamp,from&limit=50&access_token=${accessToken}`
              );
              const commentsData = await commentsRes.json();
              if (commentsData.error) return 0;

              const comments: any[] = commentsData.data ?? [];
              let upserted = 0;

              await Promise.allSettled(
                comments.map(async (comment) => {
                  const { error: upsertError } = await adminClient
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
                          from: comment.from ?? {},
                          media_id: media.id,
                        },
                        processed_at: comment.timestamp ?? new Date().toISOString(),
                        user_id: userId,
                      },
                      { onConflict: "idempotency_key", ignoreDuplicates: true }
                    );
                  if (!upsertError) upserted++;
                })
              );
              return upserted;
            })
          );

          commentResults.forEach((r) => {
            if (r.status === "fulfilled") totalUpserted += r.value ?? 0;
          });

          console.log(`[sync-comments] User ${userId}: processed ${mediaItems.length} media, upserted ${totalUpserted} new comments`);
          results.push({ userId, mediaCount: mediaItems.length, newComments: totalUpserted });
        } catch (profileErr: any) {
          console.error(`[sync-comments] Error processing profile ${profile.id}:`, profileErr.message);
          results.push({ userId: profile.id, error: profileErr.message });
        }
      })
    );
  }

  return NextResponse.json({ success: true, profiles: results.length, results }, { status: 200 });
}
