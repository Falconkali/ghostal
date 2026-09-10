import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      return new NextResponse("Failed to fetch upstream media", { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("content-type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error("Media proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
