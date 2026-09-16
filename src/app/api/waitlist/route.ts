import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Instantiate Resend inside the request handler or with a fallback so it doesn't crash the build
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple in-memory rate limiter: 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email, name } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }


    // Sanitize name: strip control characters, limit to 100 chars
    const sanitizedName = name
      ? name.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 100) || null
      : null;

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim(), name: sanitizedName });

    if (dbError) {
      if (dbError.code === "23505") {
        // Duplicate email
        return NextResponse.json(
          { error: "You're already on the waitlist! We'll be in touch soon." },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Send welcome email via Resend
    if (resend) {
      const firstName = name?.trim().split(" ")[0] || "there";

      await resend.emails.send({
        from: "Ghostal <hello@ghostal.xyz>",
        to: [email],
        subject: "You're on the Ghostal waitlist! 👻",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background-color:#09090f;font-family:Inter,system-ui,sans-serif;color:#eaeaf0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090f;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:520px;background:linear-gradient(135deg,#12121a,#0d0d18);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
                  <!-- Top gradient line -->
                  <tr>
                    <td style="height:2px;background:linear-gradient(90deg,#7c3aed,#06b6d4);"></td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding:40px 36px;">
                      <!-- Logo / Brand -->
                      <p style="margin:0 0 32px;font-size:22px;font-weight:700;background:linear-gradient(90deg,#a78bfa,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
                        👻 Ghostal
                      </p>

                      <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#fff;line-height:1.3;">
                        You&apos;re on the list, ${firstName}! 🎉
                      </h1>

                      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(234,234,240,0.6);">
                        Thanks for joining the Ghostal waitlist. You&apos;ll be among the very first to know when we open the doors.
                      </p>

                      <!-- What to expect box -->
                      <table width="100%" style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 12px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(167,139,250,0.7);">
                              What&apos;s coming for you
                            </p>
                            <p style="margin:0 0 8px;font-size:14px;color:rgba(234,234,240,0.8);">✦ Early access before public launch</p>
                            <p style="margin:0 0 8px;font-size:14px;color:rgba(234,234,240,0.8);">✦ Exclusive founding member pricing</p>
                            <p style="margin:0;font-size:14px;color:rgba(234,234,240,0.8);">✦ Priority onboarding &amp; support</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 36px;font-size:14px;line-height:1.7;color:rgba(234,234,240,0.5);">
                        In the meantime, feel free to reply to this email — we read every message.
                      </p>

                      <p style="margin:0;font-size:14px;color:rgba(234,234,240,0.5);">
                        With 👻,<br/>
                        <span style="color:#fff;font-weight:600;">The Ghostal Team</span>
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;font-size:12px;color:rgba(234,234,240,0.25);text-align:center;">
                        You received this because you signed up at ghostal.xyz
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
