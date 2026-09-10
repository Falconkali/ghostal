"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  instagramConnected?: boolean;
  instagramHandle?: string | null;
  onboardingCompleted?: boolean;
  plan?: string;
  planExpiresAt?: string | null;
  ghostModeConfig?: {
    enabled: boolean;
    inactivityThresholdDays: number;
    emergencySurvivalMode: boolean;
    aiFallbackBehavior: string;
    maxSurvivalPostsPerWeek: number;
    preserveHashtags: boolean;
    notifyOnActivation: boolean;
  } | null;
  instagramProfilePictureUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  instagramConnected: boolean;
  instagramHandle: string | null;
  connectInstagram: (handle: string) => Promise<void>;
  disconnectInstagram: () => Promise<void>;
  updateProfile: (name: string, email: string, avatarUrl?: string) => Promise<void>;
  completeOnboarding: (niche: string, frequency: string, ghostMode: boolean, triggerDays: number) => Promise<void>;
  updateGhostModeConfig: (config: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);
  // Track the currently loaded user ID to skip redundant re-auth profile fetches
  const loadedUserIdRef = useRef<string | null>(null);

  // Sync profile details from public.profiles table
  const fetchProfile = useCallback(async (authUserId: string, authUserEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile does not exist - self-heal by inserting one!
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: authUserId,
              name: authUserEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              email: authUserEmail,
              instagram_connected: false,
              instagram_handle: null
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating fallback profile:", insertError);
            return null;
          }

          if (newProfile) {
            setInstagramConnected(newProfile.instagram_connected || false);
            setInstagramHandle(newProfile.instagram_handle || null);
            
            // Always enforce dark mode
            if (typeof window !== "undefined") {
              const root = window.document.documentElement;
              root.classList.add("dark");
              root.setAttribute("data-theme", "dark");
            }

            return {
              id: newProfile.id,
              name: newProfile.name || authUserEmail.split("@")[0],
              email: newProfile.email || authUserEmail,
              avatar: newProfile.avatar_url || undefined,
              createdAt: newProfile.created_at,
              instagramConnected: newProfile.instagram_connected,
              instagramHandle: newProfile.instagram_handle,
              onboardingCompleted: newProfile.onboarding_completed || false,
              plan: newProfile.plan || "starter",
              planExpiresAt: newProfile.plan_expires_at || null,
              ghostModeConfig: newProfile.ghost_mode_config || null,
              instagramProfilePictureUrl: newProfile.instagram_profile_picture_url || null,
            };
          }
        }

        console.error("Error fetching user profile:", error);
        return null;
      }

      if (data) {
        setInstagramConnected(data.instagram_connected || false);
        setInstagramHandle(data.instagram_handle || null);
        
        // Always enforce dark mode
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.add("dark");
          root.setAttribute("data-theme", "dark");
        }

        const profile = {
          id: data.id,
          name: data.name || authUserEmail.split("@")[0],
          email: data.email || authUserEmail,
          avatar: data.avatar_url || undefined,
          createdAt: data.created_at,
          instagramConnected: data.instagram_connected || false,
          instagramHandle: data.instagram_handle || null,
          onboardingCompleted: data.onboarding_completed || false,
          plan: data.plan || "starter",
          planExpiresAt: data.plan_expires_at || null,
          ghostModeConfig: data.ghost_mode_config || null,
          instagramProfilePictureUrl: data.instagram_profile_picture_url || null,
        };
        loadedUserIdRef.current = data.id;
        return profile;
      }
    } catch (err) {
      console.error("Failed to sync profile:", err);
    }
    return null;
  }, []);

  // Listen to Auth changes
  useEffect(() => {
    let mounted = true;

    // Safety net: never hang on "Validating session" longer than 6 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn("Auth safety timeout fired — forcing isLoading=false");
        setIsLoading(false);
      }
    }, 6000);

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && mounted) {
          // Remember Me check: if user logged in without "remember me",
          // sign them out when their browser session ends (sessionStorage is cleared on close)
          const hasRememberMe = typeof window !== "undefined" && localStorage.getItem("Ghostal_remember_me") === "1";
          const hasSessionFlag = typeof window !== "undefined" && sessionStorage.getItem("Ghostal_session_only") === "1";

          if (!hasRememberMe && !hasSessionFlag) {
            // Browser was closed with remember me unchecked — sign out silently
            await supabase.auth.signOut();
            if (mounted) setIsLoading(false);
            return;
          }

          try {
            const profile = await fetchProfile(session.user.id, session.user.email || "");
            if (profile && mounted) {
              setUser(profile);
            } else if (mounted) {
              setUser({
                id: session.user.id,
                name: session.user.email?.split("@")[0] || "User",
                email: session.user.email || "",
                createdAt: session.user.created_at,
              });
            }
          } catch (profileErr) {
            console.error("Profile fetch error (fallback applied):", profileErr);
            if (mounted) {
              setUser({
                id: session.user.id,
                name: session.user.email?.split("@")[0] || "User",
                email: session.user.email || "",
                createdAt: session.user.created_at,
              });
            }
          }
        }
      } catch (err) {
        console.error("Session fetching error:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          // If this SIGNED_IN event is a re-auth for the SAME user already loaded
          // (e.g. password change re-verification), skip the profile refetch.
          // This prevents the DashboardLayout from flickering into a loading spinner.
          if (event === "SIGNED_IN" && loadedUserIdRef.current === session.user.id) {
            clearTimeout(safetyTimer);
            if (mounted) setIsLoading(false);
            return;
          }

          // Defer the async profile fetch using setTimeout to prevent deadlocking the Supabase Auth client
          setTimeout(async () => {
            if (!mounted) return;
            try {
              const profile = await fetchProfile(session.user.id, session.user.email || "");
              if (profile && mounted) {
                setUser(profile);
              } else if (mounted) {
                setUser({
                  id: session.user.id,
                  name: session.user.email?.split("@")[0] || "User",
                  email: session.user.email || "",
                  createdAt: session.user.created_at,
                });
              }
            } catch (profileErr) {
              console.error("Profile fetch in auth change error:", profileErr);
              if (mounted) {
                setUser({
                  id: session.user.id,
                  name: session.user.email?.split("@")[0] || "User",
                  email: session.user.email || "",
                  createdAt: session.user.created_at,
                });
              }
            } finally {
              clearTimeout(safetyTimer);
              if (mounted) setIsLoading(false);
            }
          }, 0);

        } else if (event === "SIGNED_OUT") {
          clearTimeout(safetyTimer);
          if (mounted) {
            // Redirect immediately to login if on a protected dashboard path to prevent flashing/stale views
            if (typeof window !== "undefined") {
              const path = window.location.pathname;
              const protectedPaths = ["/dashboard", "/vault", "/scheduler", "/ghost-mode", "/ai-survival", "/settings"];
              const isProtectedRoute = protectedPaths.some(p => path === p || path.startsWith(p + "/"));
              if (isProtectedRoute) {
                window.location.href = "/login";
                return;
              }
            }

            setUser(null);
            setInstagramConnected(false);
            setInstagramHandle(null);
            setIsLoading(false);
          }
        } else {
          // Any other event (TOKEN_REFRESHED, USER_UPDATED, etc.) — ensure loading ends
          clearTimeout(safetyTimer);
          if (mounted) setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // Persist session preference
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("Ghostal_remember_me", "1");
        sessionStorage.removeItem("Ghostal_session_only");
      } else {
        localStorage.removeItem("Ghostal_remember_me");
        sessionStorage.setItem("Ghostal_session_only", "1");
      }
    }

    router.refresh();
  }, [router]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }
    const redirectToUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/callback?next=/dashboard`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: redirectToUrl,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
    router.refresh();
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Signout error:", error);
    } catch (err) {
      console.error("Unhandled error during logout:", err);
    } finally {
      if (typeof window !== "undefined") {
        // Clear all cached data
        localStorage.removeItem("Ghostal_vault_items");
        localStorage.removeItem("Ghostal_scheduled_posts");
        localStorage.removeItem("Ghostal_ghost_mode_config");
        localStorage.removeItem("Ghostal_survival_logs");
        // Clear remember me flag so next visit requires login
        localStorage.removeItem("Ghostal_remember_me");
        sessionStorage.removeItem("Ghostal_session_only");
      }
      window.location.href = "/login";
    }
  }, []);

  const connectInstagram = useCallback(async (handle: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        instagram_connected: true,
        instagram_handle: handle,
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    setInstagramConnected(true);
    setInstagramHandle(handle);
    setUser(prev => prev ? { ...prev, instagramConnected: true, instagramHandle: handle } : null);
  }, [user]);

  const disconnectInstagram = useCallback(async () => {
    if (!user) return;

    // Use server-side route with service role key — bypasses RLS
    const res = await fetch("/api/instagram/disconnect", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      console.error("[disconnectInstagram] API error:", data.error);
      throw new Error(data.error || "Failed to disconnect Instagram.");
    }

    setInstagramConnected(false);
    setInstagramHandle(null);
    setUser(prev => prev ? { ...prev, instagramConnected: false, instagramHandle: null } : null);
    localStorage.removeItem("Ghostal_vault_items");
    localStorage.removeItem("Ghostal_scheduled_posts");
  }, [user]);

  const updateProfile = useCallback(async (name: string, email: string, avatarUrl?: string) => {
    if (!user) return;
    const updateData: { name: string; email: string; avatar_url?: string } = { name, email };
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    setUser(prev => prev ? {
      ...prev,
      name,
      email,
      ...(avatarUrl !== undefined ? { avatar: avatarUrl } : {})
    } : null);
  }, [user]);

  const completeOnboarding = useCallback(async (
    niche: string,
    frequency: string,
    ghostMode: boolean,
    triggerDays: number
  ) => {
    if (!user) return;

    const onboardingData = {
      niche,
      frequency,
      ghostMode,
      triggerDays
    };

    const updatedGhostConfig = {
      enabled: ghostMode,
      inactivityThresholdDays: triggerDays,
      emergencySurvivalMode: true,
      aiFallbackBehavior: "remix_captions" as const,
      maxSurvivalPostsPerWeek: 5,
      preserveHashtags: true,
      notifyOnActivation: true,
    };

    // Perform DB update FIRST, then update local state to keep them in sync
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_data: onboardingData,
          ghost_mode_config: updatedGhostConfig
        })
        .eq("id", user.id);

      if (error) {
        console.warn("Onboarding save failed:", error.message);
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("Onboarding DB exception:", err.message);
      throw err;
    }

    // Update local state only after successful DB write
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
  }, [user]);

  const updateGhostModeConfig = useCallback(async (newConfig: any) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ghostModeConfig: newConfig } : null);
    try {
      await supabase
        .from("profiles")
        .update({ ghost_mode_config: newConfig })
        .eq("id", user.id);
    } catch (err) {
      console.error("[useAuth] Error saving ghostModeConfig:", err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        instagramConnected,
        instagramHandle,
        connectInstagram,
        disconnectInstagram,
        updateProfile,
        completeOnboarding,
        updateGhostModeConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
