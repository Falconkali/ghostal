import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the form data sent from the client
    const formData = await req.formData();

    // Forward the exact same form data to Cloudinary from the server
    const cloudRes = await fetch(
      "https://api.cloudinary.com/v1_1/da8jrztp0/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await cloudRes.json();

    if (!cloudRes.ok) {
      return NextResponse.json({ error: data.error?.message || "Cloudinary upload failed" }, { status: cloudRes.status });
    }

    // Return the successful Cloudinary response back to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
