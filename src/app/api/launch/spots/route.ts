import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("launch_config")
      .select("spots_remaining, spots_total")
      .single();

    if (error || !data) {
      // Fallback if table not created yet
      return NextResponse.json({ remaining: 100, total: 100 });
    }

    return NextResponse.json({
      remaining: data.spots_remaining,
      total: data.spots_total,
    });
  } catch {
    return NextResponse.json({ remaining: 100, total: 100 });
  }
}
