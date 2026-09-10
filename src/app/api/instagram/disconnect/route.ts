import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { validateCsrfOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  try {
    // Auth check — must be logged in
    const serverClient = await createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // CSRF check
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("profiles")
      .update({
        instagram_connected: false,
        instagram_handle: null,
        instagram_token: null,
        instagram_id: null,
      })
      .eq("id", user.id);

    if (error) {
      console.error("[instagram/disconnect] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also try to clear stat columns if they exist
    await supabase
      .from("profiles")
      .update({
        instagram_username: null,
        instagram_followers_count: 0,
        instagram_following_count: 0,
        instagram_media_count: 0,
      })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[instagram/disconnect] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
