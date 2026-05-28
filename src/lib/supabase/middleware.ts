import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Warning: Missing Supabase environment variables. Using fallback placeholders in Middleware.");
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  // This will refresh the session if it is expired
  const { data: { user } } = await supabase.auth.getUser();

  // Route Protection Logic
  const path = request.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/vault", "/scheduler", "/ghost-mode", "/ai-survival", "/settings"];
  const isProtectedRoute = protectedPaths.some(p => path === p || path.startsWith(p + "/"));

  const authPaths = ["/login", "/signup", "/forgot-password"];
  const isAuthRoute = authPaths.some(p => path === p || path.startsWith(p + "/"));

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated user to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // Redirect authenticated user to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
