"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  instagramConnected: boolean;
  instagramHandle: string | null;
  connectInstagram: (handle: string) => Promise<void>;
  disconnectInstagram: () => Promise<void>;
  updateProfile: (name: string, email: string, avatarUrl?: string) => Promise<void>;
  completeOnboarding: (niche: string, frequency: string, ghostMode: boolean, triggerDays: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);

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
            
            // Sync theme immediately
            if (typeof window !== "undefined") {
              const root = window.document.documentElement;
              if (newProfile.theme === "light") {
                root.classList.remove("dark");
              } else {
                root.classList.add("dark");
              }
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
            };
          }
        }

        console.error("Error fetching user profile:", error);
        return null;
      }

      if (data) {
        setInstagramConnected(data.instagram_connected || false);
        setInstagramHandle(data.instagram_handle || null);
        
        // Sync theme immediately
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          if (data.theme === "light") {
            root.classList.remove("dark");
          } else {
            root.classList.add("dark");
          }
        }

        return {
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
        };
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
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
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

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    router.refresh();
  }, [router]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }
    const redirectToUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/auth/callback?next=/dashboard`
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
      if (error) {
        console.error("Signout error:", error);
      }
    } catch (err) {
      console.error("Unhandled error during logout:", err);
    } finally {
      // Force full reload and navigation to login to destroy any stale client-side router caches
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
    const { error } = await supabase
      .from("profiles")
      .update({
        instagram_connected: false,
        instagram_handle: null,
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    setInstagramConnected(false);
    setInstagramHandle(null);
    setUser(prev => prev ? { ...prev, instagramConnected: false, instagramHandle: null } : null);
  }, [user]);

  const updateProfile = useCallback(async (name: string, email: string, avatarUrl?: string) => {
    if (!user) return;
    const updateData: any = { name, email };
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
    
    // 1. Instantly update local client state to allow routing transition
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);

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
    
    // 2. Perform DB update asynchronously in background
    (async () => {
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
          console.warn("Background onboarding save skipped or RLS restricted:", error.message);
        }
      } catch (err: any) {
        console.warn("Unhandled onboarding DB exception:", err.message);
      }
    })();
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
