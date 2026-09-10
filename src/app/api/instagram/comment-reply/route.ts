import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decrypt } from "@/lib/crypto";

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

    if (!comment_id || !message?.trim()) {
      return NextResponse.json(
        { error: "comment_id and message are required" },
        { status: 400 }
      );
    }

    // 3. Fetch user's Instagram token from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token, instagram_connected")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instagram_token || !profile?.instagram_connected) {
      return NextResponse.json(
        { error: "Instagram account not connected" },
        { status: 400 }
      );
    }

    const accessToken = decrypt(profile.instagram_token);

    // 4. Call Instagram Graph API to post the reply
    const replyUrl = `https://graph.instagram.com/v21.0/${comment_id}/replies`;
    const replyRes = await fetch(replyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        message: message.trim(),
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
