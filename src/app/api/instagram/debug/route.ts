import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decrypt } from "@/lib/crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => "", set: () => {}, remove: () => {}
      },
    }
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("instagram_token, instagram_id")
    .eq("id", "d41334f0-5fd9-437c-813f-8bfff930e9e2")
    .single();

  if (!profile || !profile.instagram_token) {
    return NextResponse.json({ error: "No token" });
  }

  const token = decrypt(profile.instagram_token);
  
  const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  let scopes = "unknown";

  if (appId && appSecret) {
    const appToken = `${appId}|${appSecret}`;
    const debugUrl = `https://graph.instagram.com/debug_token?input_token=${token}&access_token=${appToken}`;
    try {
      const debugRes = await fetch(debugUrl).then(res => res.json());
      if (debugRes.data && debugRes.data.scopes) {
        scopes = debugRes.data.scopes.join(",");
      }
    } catch(e: any) {}
  }

  const mediaUrl = `https://graph.instagram.com/v21.0/${profile.instagram_id}/media?fields=id,comments_count&limit=1&access_token=${token}`;
  const mediaData = await fetch(mediaUrl).then(res => res.json());
  
  let commentsData = null;
  let fbCommentsData = null;
  if (mediaData.data && mediaData.data.length > 0) {
    const mediaId = mediaData.data[0].id;
    const commentsUrl = `https://graph.instagram.com/v21.0/${mediaId}/comments?fields=id,text,timestamp,username&limit=5&access_token=${token}`;
    commentsData = await fetch(commentsUrl).then(res => res.json());

    const commentsUrlNoUser = `https://graph.instagram.com/v21.0/${mediaId}/comments?fields=id,text,timestamp&limit=5&access_token=${token}`;
    const commentsDataNoUser = await fetch(commentsUrlNoUser).then(res => res.json());
    
    commentsData.noUserTest = commentsDataNoUser;

    const fbCommentsUrl = `https://graph.facebook.com/v21.0/${mediaId}/comments?access_token=${token}`;
    fbCommentsData = await fetch(fbCommentsUrl).then(res => res.json());
  }

  return NextResponse.json({
    tokenStartsWith: token.substring(0, 10),
    scopes,
    media: mediaData,
    comments: commentsData,
    fbComments: fbCommentsData
  });
}
