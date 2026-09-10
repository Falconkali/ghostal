"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Handle explicit error redirects first
      const errorDescription = searchParams.get("error_description") || new URLSearchParams(window.location.hash.substring(1)).get("error_description");
      if (errorDescription) {
        console.error("[callback] Error from Supabase:", errorDescription);
        router.replace(`/login?error=${encodeURIComponent(errorDescription)}`);
        return;
      }

      // 2. Modern token_hash flow (Supabase v2 + Resend)
      const tokenHash = searchParams.get("token_hash");
      const typeFromQuery = searchParams.get("type");

      if (tokenHash && typeFromQuery) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: typeFromQuery as any,
        });

        if (error) {
          router.replace(`/forgot-password?error=${encodeURIComponent(error.message)}`);
          return;
        }

        router.replace(typeFromQuery === "recovery" ? "/reset-password" : "/dashboard");
        return;
      }

      // 3. Legacy Hash tokens (implicit flow fallback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const typeFromHash = hashParams.get("type");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          router.replace(`/forgot-password?error=${encodeURIComponent(error.message)}`);
          return;
        }

        router.replace(typeFromHash === "recovery" ? "/reset-password" : "/dashboard");
        return;
      }

      // 4. PKCE code flow (standard fallback)
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/reset-password";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        router.replace(next);
        return;
      }

      // If we got here with absolutely no auth info, just send them to login
      router.replace("/login");
    };

    handleCallback();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      <p className="text-sm font-medium text-white/50 animate-pulse">
        Verifying secure session...
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070a] p-4">
      <div className="glass-strong glow-violet rounded-2xl p-8 flex w-full max-w-sm flex-col items-center justify-center">
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-violet-400" />}>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  );
}
