import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

/**
 * POST /api/instagram/comment-reply
 * Body: { comment_id: string, message: string }
 *
 * Replies to an Instagram comment on behalf of the authenticated user.
 * Requires the instagram_business_manage_comments permission.
 */
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF protection
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json();
    const { comment_id, message } = body;

    if (!comment_id || typeof comment_id !== "string" || !message?.trim()) {
      return NextResponse.json(
        { error: "comment_id and message are required" },
        { status: 400 }
      );
    }

    // Sanitize: comment_id must look like a numeric Instagram ID
    if (!/^\d+$/.test(comment_id.trim())) {
      return NextResponse.json(
        { error: "Invalid comment_id format" },
        { status: 400 }
      );
    }

    // Limit message length
    const trimmedMessage = message.trim().slice(0, 2200);

    // 3. Fetch user's Instagram token + instagram_id from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token, instagram_id, instagram_connected")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instagram_token || !profile?.instagram_connected) {
      return NextResponse.json(
        { error: "Instagram account not connected" },
        { status: 400 }
      );
    }

    const accessToken = decrypt(profile.instagram_token);
    const igUserId = profile.instagram_id;

    // 4. Verify the comment belongs to the user's own media (prevents API abuse)
    if (igUserId) {
      const commentCheckRes = await fetch(
        `https://graph.instagram.com/v21.0/${comment_id}?fields=media&access_token=${accessToken}`
      );
      const commentCheckData = await commentCheckRes.json();

      if (commentCheckData.error) {
        // Comment not found or not accessible — do not proceed
        return NextResponse.json(
          { error: "Comment not found or not accessible" },
          { status: 404 }
        );
      }

      // Fetch the media owner to ensure it belongs to this user
      const mediaId = commentCheckData.media?.id;
      if (mediaId) {
        const mediaCheckRes = await fetch(
          `https://graph.instagram.com/v21.0/${mediaId}?fields=owner&access_token=${accessToken}`
        );
        const mediaCheckData = await mediaCheckRes.json();
        const ownerId = mediaCheckData.owner?.id;

        if (ownerId && ownerId !== igUserId) {
          return NextResponse.json(
            { error: "Comment does not belong to your media" },
            { status: 403 }
          );
        }
      }
    }

    // 5. Call Instagram Graph API to post the reply
    const replyUrl = `https://graph.instagram.com/v21.0/${comment_id}/replies`;
    const replyRes = await fetch(replyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        message: trimmedMessage,
        access_token: accessToken,
      }),
    });

    const replyData = await replyRes.json();

    if (replyData.error) {
      console.error("[comment-reply] Instagram API error:", replyData.error);
      return NextResponse.json(
        { error: replyData.error.message || "Failed to post reply" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, reply_id: replyData.id });
  } catch (err: any) {
    console.error("[comment-reply] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
