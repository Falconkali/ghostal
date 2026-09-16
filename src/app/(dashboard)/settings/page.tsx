"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Instagram,
  Bell,
  Brain,
  Check,
  Shield,
  Loader2,
  Lock,
  Globe,
  Settings,
  Mail,
  Smartphone,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  Copy,
  X,
  CreditCard,
  ExternalLink,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { GhostModeConfig } from "@/types";

import { Suspense } from "react";

function SettingsContent() {
  const { instagramConnected, instagramHandle, connectInstagram, disconnectInstagram, updateProfile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "profile" | "instagram" | "notifications" | "ai" | "security" | "billing"
  >("profile");

  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [billingData, setBillingData] = useState<{
    plan: string;
    subscription_status: string | null;
    trial_ends_at: string | null;
    paddle_subscription_id: string | null;
    paddle_customer_id: string | null;
    payment_provider: string | null;
  }>({
    plan: "starter",
    subscription_status: null,
    trial_ends_at: null,
    paddle_subscription_id: null,
    paddle_customer_id: null,
    payment_provider: "paddle",
  });
  const [cancelingSub, setCancelingSub] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  // Handle OAuth callback params (?success=instagram_connected or ?error=...)
  const searchParams = useSearchParams();
  const handledCallbackRef = useRef(false);
  useEffect(() => {
    if (handledCallbackRef.current) return;
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");
    if (successParam === "instagram_connected") {
      handledCallbackRef.current = true;
      setActiveTab("instagram");
      setSuccessMessage("Instagram account connected successfully! 🎉");
      setTimeout(() => setSuccessMessage(null), 4000);
      // Clean up the URL without a page reload
      window.history.replaceState({}, "", "/settings");
    } else if (errorParam) {
      handledCallbackRef.current = true;
      setActiveTab("instagram");
      setErrorMessage(decodeURIComponent(errorParam));
      setTimeout(() => setErrorMessage(null), 6000);
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inactivityThreshold: 3,
    emergencySurvival: true,
    aiModel: "remix_captions",
    maxPosts: 5,
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [customHandle, setCustomHandle] = useState("");

  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>({
    starvation: true,
    activation: true,
    report: true,
  });
  const [theme, setTheme] = useState<string>("dark");

  // Multi-Factor Authentication (MFA / 2FA)
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [isLoadingMFA, setIsLoadingMFA] = useState(true);
  const [mfaEnrollData, setMfaEnrollData] = useState<{ id: string; qrCode: string; secret: string; uri: string } | null>(null);
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");
  const [isMFAEnrolling, setIsMFAEnrolling] = useState(false);
  const [isMFAVerifying, setIsMFAVerifying] = useState(false);
  const [isMFADisabling, setIsMFADisabling] = useState(false);

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableMFAModal, setShowDisableMFAModal] = useState(false);
  const [updatingPref, setUpdatingPref] = useState<string | null>(null);

  const handleCopySecret = async () => {
    if (mfaEnrollData?.secret) {
      await navigator.clipboard.writeText(mfaEnrollData.secret);
      setSuccessMessage("Secret copied to clipboard!");
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 2MB");
      return;
    }

    setAvatarUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      await updateProfile(formData.name || user.name, formData.email || user.email, publicUrl);
      setSuccessMessage("Avatar updated successfully!");
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setErrorMessage(err.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Load user data & configurations
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      
      const loadDBConfig = async () => {
        setIsLoadingProfile(true);
        try {
          const { data } = await supabase
            .from("profiles")
            .select("ghost_mode_config, notification_preferences, theme, plan, subscription_status, trial_ends_at, paddle_subscription_id, paddle_customer_id, payment_provider")
            .eq("id", user.id)
            .single();
            
          if (data) {
            if (data.ghost_mode_config) {
              const config = data.ghost_mode_config as GhostModeConfig;
              setFormData((prev) => ({
                ...prev,
                inactivityThreshold: config.inactivityThresholdDays ?? 3,
                emergencySurvival: config.emergencySurvivalMode ?? true,
                aiModel: config.aiFallbackBehavior ?? "remix_captions",
                maxPosts: config.maxSurvivalPostsPerWeek ?? 5,
              }));
            }
            if (data.notification_preferences) {
              setNotificationPrefs(data.notification_preferences as any);
            }
            if (data.plan) {
              setBillingData({
                plan: data.plan || "starter",
                subscription_status: data.subscription_status || null,
                trial_ends_at: data.trial_ends_at || null,
                paddle_subscription_id: data.paddle_subscription_id || null,
                paddle_customer_id: data.paddle_customer_id || null,
                payment_provider: data.payment_provider || "paddle",
              });
            }
            if (typeof window !== "undefined") {
              const root = window.document.documentElement;
              root.classList.add("dark");
              root.setAttribute("data-theme", "dark");
            }
          }
        } catch (err) {
          console.error("Failed to load settings configuration:", err);
        } finally {
          setIsLoadingProfile(false);
        }
      };
      
      loadDBConfig();
      fetchMFAStatus();
    }
  }, [user?.id]);

  const fetchMFAStatus = async () => {
    if (!user) return;
    setIsLoadingMFA(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      if (data) {
        const verifiedFactors = data.all.filter((f: any) => f.status === "verified");
        setMfaFactors(data.all);
        setIsMFAEnabled(verifiedFactors.length > 0);
      }
    } catch (err: any) {
      console.error("Error listing MFA factors:", err);
    } finally {
      setIsLoadingMFA(false);
    }
  };


  // Handle Profile Details Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateProfile(formData.name, formData.email);
      setSuccessMessage("Profile details updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error saving profile details:", err);
      setErrorMessage(err.message || "Failed to save profile details.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Handle AI Survival Config Save
  const handleSaveAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // Fetch latest config to keep enablement state intact
      const { data: profile } = await supabase
        .from("profiles")
        .select("ghost_mode_config")
        .eq("id", user.id)
        .single();
      
      const prevConfig = profile?.ghost_mode_config || { enabled: true };

      const updatedConfig: GhostModeConfig = {
        enabled: prevConfig.enabled ?? true,
        inactivityThresholdDays: formData.inactivityThreshold,
        emergencySurvivalMode: formData.emergencySurvival,
        aiFallbackBehavior: formData.aiModel as any,
        maxSurvivalPostsPerWeek: formData.maxPosts,
        preserveHashtags: true,
        notifyOnActivation: true,
      };

      const { error } = await supabase
        .from("profiles")
        .update({ ghost_mode_config: updatedConfig })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving AI config:", error);
      } else {
        setSuccessMessage("AI configuration saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        // Refresh timers in background
        window.dispatchEvent(new Event("automation_run"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!passwordData.current) {
      setErrorMessage("Please enter your current password.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (passwordData.newPass.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setErrorMessage("Passwords do not match.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (passwordData.current === passwordData.newPass) {
      setErrorMessage("New password must be different from your current password.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setPasswordSaving(true);
    setErrorMessage(null);
    try {
      // Step 1: Re-authenticate with current password before allowing change
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.current,
      });
      if (reAuthError) {
        throw new Error("Current password is incorrect.");
      }

      // Step 2: Update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPass,
      });
      if (error) throw error;
      setSuccessMessage("Password updated successfully!");
      setPasswordData({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleStartMFAEnroll = async () => {
    if (!user) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsMFAEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Ghostal",
        friendlyName: user.email,
      });
      if (error) throw error;
      if (data) {
        setMfaEnrollData({
          id: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
          uri: data.totp.uri,
        });
      }
    } catch (err: any) {
      console.error("Error enrolling MFA:", err);
      setErrorMessage(err.message || "Failed to start 2FA enrollment.");
      setIsMFAEnrolling(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mfaEnrollData) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsMFAVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaEnrollData.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollData.id,
        challengeId: challengeData.id,
        code: mfaVerificationCode,
      });
      if (verifyError) throw verifyError;

      setSuccessMessage("Two-factor authentication successfully enabled!");
      setMfaEnrollData(null);
      setMfaVerificationCode("");
      setIsMFAEnrolling(false);
      await fetchMFAStatus();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error verifying MFA challenge:", err);
      setErrorMessage(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsMFAVerifying(false);
    }
  };

  const handleCancelMFAEnroll = () => {
    setMfaEnrollData(null);
    setMfaVerificationCode("");
    setIsMFAEnrolling(false);
    setErrorMessage(null);
  };

  const handleDisableMFA = async () => {
    if (!user) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsMFADisabling(true);
    try {
      const verifiedFactor = mfaFactors.find((f: any) => f.status === "verified");
      if (!verifiedFactor) {
        throw new Error("No active verified 2FA factor found.");
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });
      if (error) throw error;

      setSuccessMessage("Two-factor authentication successfully disabled.");
      setIsMFAEnabled(false);
      setMfaFactors([]);
      setShowDisableMFAModal(false);
      await fetchMFAStatus();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error unenrolling MFA:", err);
      setErrorMessage(err.message || "Failed to disable 2FA.");
    } finally {
      setIsMFADisabling(false);
    }
  };

  // Handle Instagram Link Toggle
  const toggleInstagram = async () => {
    setErrorMessage(null);
    if (instagramConnected) {
      setConnecting(true);
      try {
        await disconnectInstagram();
        setCustomHandle("");
        setSuccessMessage("Instagram account disconnected successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Failed to disconnect Instagram.");
        setTimeout(() => setErrorMessage(null), 4000);
      } finally {
        setConnecting(false);
      }
    } else {
      setConnecting(true);
      // Instagram Business Login — uses instagram.com/oauth/authorize with the Instagram App ID.
      // Redirect URI must be registered in Meta Developer > Use Cases > Business login settings.
      const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
      if (!instagramAppId) {
        setErrorMessage("Instagram App ID is not configured. Please contact support.");
        setConnecting(false);
        return;
      }
      const redirectUri = `${window.location.origin}/api/auth/instagram/callback`;
      const scope = "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights";
      // Generate a random state token for CSRF protection (OAuth 2.0 §10.12)
      const stateToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      // Store state in BOTH sessionStorage (client backup) AND a cookie so the
      // server-side callback route can read and verify it.
      sessionStorage.setItem("ig_oauth_state", stateToken);
      document.cookie = `ig_oauth_state=${stateToken}; path=/; SameSite=Lax; Max-Age=600`;
      const oauthUrl = `https://www.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${stateToken}`;
      
      window.location.href = oauthUrl;
    }
  };

  // Toggle Notification Preference
  const toggleNotificationPref = async (key: "starvation" | "activation" | "report") => {
    if (!user) return;
    setUpdatingPref(key);
    const updated = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(updated);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: updated })
        .eq("id", user.id);
      
      if (error) throw error;
      setSuccessMessage("Notification preferences saved successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      console.error("Error saving notification preferences:", err);
      setErrorMessage(err.message || "Failed to update notification preferences.");
      setTimeout(() => setErrorMessage(null), 3000);
      // Rollback UI
      setNotificationPrefs(notificationPrefs);
    } finally {
      setUpdatingPref(null);
    }
  };

  // Toggle Dark/Light Theme (Dark Mode Enforced)
  const toggleTheme = async () => {
    if (!user) return;
    setTheme("dark");
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const { error: rpcError } = await supabase.rpc("delete_user");
      if (rpcError) throw rpcError;
      
      await supabase.auth.signOut();
      window.location.href = "/signup?deleted=true";
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setErrorMessage(err.message || "Failed to delete account. Please try again.");
      setTimeout(() => setErrorMessage(null), 5000);
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? Your cancellation will take effect at the end of the current billing period, so you will keep your full access until then."
      )
    )
      return;
    setCancelingSub(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paddle/cancel-subscription", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel subscription");
      setSuccessMessage(data.message || "Subscription cancellation scheduled successfully.");
      setBillingData((prev) => ({
        ...prev,
        subscription_status: "canceling",
      }));
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel subscription.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setCancelingSub(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setOpeningPortal(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paddle/portal-session", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open customer portal.");
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to open customer portal.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setOpeningPortal(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "instagram", label: "Instagram Link", icon: Instagram },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "ai", label: "AI Survival", icon: Brain },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account credentials, platform links, integrations, and AI presets.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm font-semibold flex items-center gap-2"
          >
            <AlertTriangle className="h-5 w-5" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-1 md:col-span-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-violet-600/20 text-white border border-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className={`h-4.5 w-4.5 ${activeTab === tab.id ? "text-violet-400" : "text-zinc-500"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="glass rounded-2xl p-6 glow-violet border border-white/5"
            >
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Profile Details</h3>
                    <p className="text-xs text-muted-foreground">Update your avatar, display name, and email address.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover shadow-lg border border-white/10" />
                    ) : (
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-2xl font-bold text-white shadow-lg uppercase select-none">
                        {formData.name ? formData.name.charAt(0) : "U"}
                      </div>
                    )}
                    <div>
                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                      />
                      <button
                        type="button"
                        disabled={avatarUploading}
                        onClick={() => document.getElementById("avatar-input")?.click()}
                        className="rounded-lg bg-white/5 border border-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {avatarUploading ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading…
                          </span>
                        ) : (
                          "Change Avatar"
                        )}
                      </button>
                      <p className="text-[10px] text-zinc-500 mt-1">JPG, PNG, up to 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                      {isLoadingProfile ? (
                        <div className="h-9 rounded-lg bg-white/5 animate-pulse" />
                      ) : (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-white/5 bg-white/5 py-2 px-3.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
                          required
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                      {isLoadingProfile ? (
                        <div className="h-9 rounded-lg bg-white/5 animate-pulse" />
                      ) : (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-white/5 bg-white/5 py-2 px-3.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving || isLoadingProfile}
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Details"
                      )}
                    </button>
                  </div>
                </form>

                {/* Danger Zone */}
                <div className="border-t border-red-500/10 mt-8 pt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      Danger Zone
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Permanently delete your Ghostal account and erase all data. This action is irreversible.
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-foreground">Delete Account</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">All scheduled posts, media files, and profiles will be deleted instantly.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={saving}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Billing &amp; Plan</h3>
                  <p className="text-xs text-muted-foreground">Manage your subscription, plan limits, and payment details.</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/5 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Plan</p>
                      <h4 className="text-xl font-bold text-foreground capitalize mt-1">
                        {billingData.plan === "starter" ? "Ghostal Starter" : billingData.plan === "creator_pro" ? "Creator Pro" : billingData.plan === "survival_ai" ? "Survival AI" : billingData.plan}
                      </h4>
                      {billingData.subscription_status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Active Subscription
                        </span>
                      )}
                      {billingData.subscription_status === "CANCELLED" && (
                        <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Cancelled
                        </span>
                      )}
                    </div>
                    {billingData.plan === "starter" ? (
                      <a href="/#pricing" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-all">
                        Upgrade Plan
                      </a>
                    ) : (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelingSub || billingData.subscription_status === "CANCELLED"}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {cancelingSub ? "Canceling..." : billingData.subscription_status === "CANCELLED" ? "Already Cancelled" : "Cancel Subscription"}
                      </button>
                    )}
                  </div>

                  {billingData.trial_ends_at && new Date(billingData.trial_ends_at) > new Date() && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-muted-foreground">
                        Your free trial ends on <span className="font-semibold text-white">{new Date(billingData.trial_ends_at).toLocaleDateString()}</span>.
                        You will not be charged before this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* INSTAGRAM TAB */}
              {activeTab === "instagram" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Instagram Integration</h3>
                    <p className="text-xs text-muted-foreground">Configure connection to your Instagram Professional/Creator account.</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col gap-5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600/10 text-pink-400 border border-pink-500/10 shrink-0 overflow-hidden">
                        {instagramConnected && user?.instagramProfilePictureUrl ? (
                          <img src={user.instagramProfilePictureUrl} alt="Instagram Profile" className="h-full w-full object-cover" />
                        ) : (
                          <Instagram className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {instagramConnected ? (instagramHandle || "@your_account") : "Instagram API Link"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {instagramConnected ? "Sync active. Content Vault & Scheduler are connected to database." : "Connect to auto-publish assets and sync metrics."}
                        </p>
                      </div>
                    </div>

                    {!instagramConnected && (
                      <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                        Establishing a link will redirect you to Meta's secure Login for Business. 
                        Make sure your Instagram Professional/Creator account is linked to a Facebook Page.
                      </p>
                    )}

                    <div className="flex justify-start">
                      <button
                        onClick={toggleInstagram}
                        disabled={connecting}
                        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          instagramConnected
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10"
                            : "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg shadow-violet-500/10"
                        }`}
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Establishing link...
                          </>
                        ) : instagramConnected ? (
                          "Disconnect Link"
                        ) : (
                          "Link Instagram Account"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <Shield className="h-4 w-4 text-violet-400" />
                        API Permissions Granted
                      </div>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4 mt-2 leading-relaxed">
                        <li>Read account metrics & media insight logs</li>
                        <li>Publish reels, carousels, single-image posts</li>
                        <li>Create & read comments on published media</li>
                        <li>Fetch account list & username updates</li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <Globe className="h-4 w-4 text-cyan-400" />
                        Upcoming APIs
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                        Facebook Graph integration and direct Threads support are planned for Q3. Keep notifications active to authorize new scopes immediately.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Alert Preferences</h3>
                    <p className="text-xs text-muted-foreground">Configure how and when Ghostal reaches you.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: "starvation" as const,
                        title: "Queue Starvation Alerts",
                        desc: "Ping when scheduled posts run below 3 days of content.",
                        icon: Mail,
                      },
                      {
                        id: "activation" as const,
                        title: "Ghost Mode Activation Notifications",
                        desc: "Send high-priority alerts via SMS/Email as soon as Ghost Mode triggers.",
                        icon: Smartphone,
                      },
                      {
                        id: "report" as const,
                        title: "Weekly Momentum Report",
                        desc: "Receive automated analysis of reach fluctuations and AI resurrections.",
                        icon: Globe,
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex gap-3">
                          <item.icon className="h-5 w-5 text-zinc-500 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={notificationPrefs[item.id]}
                            onChange={() => toggleNotificationPref(item.id)}
                            disabled={updatingPref === item.id}
                            className="peer sr-only"
                          />
                          <div className={cn("peer h-5 w-9 rounded-full bg-white/5 border border-white/10 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-zinc-400 after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:outline-none", updatingPref === item.id && "opacity-50")} />
                          {updatingPref === item.id && (
                            <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-violet-400" />
                          )}
                        </label>
                      </div>
                    ))}
                  </div>


                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-8 divide-y divide-white/5">
                  {/* Change Password */}
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                      <p className="text-xs text-muted-foreground">Update your account password. Must be at least 8 characters.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPass}
                          onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                          placeholder="Min. 8 characters"
                          className="w-full rounded-lg border border-white/5 bg-white/5 py-2 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          placeholder="Repeat new password"
                          className={`w-full rounded-lg border py-2 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:bg-white/[0.07] transition-all bg-white/5 ${
                            passwordData.confirm && passwordData.newPass !== passwordData.confirm
                              ? "border-red-500/50 focus:border-red-500/70"
                              : "border-white/5 focus:border-violet-500/50"
                          }`}
                          required
                        />
                        {passwordData.confirm && passwordData.newPass !== passwordData.confirm && (
                          <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                      <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-400" />
                        Password Requirements
                      </p>
                      <ul className="text-xs text-zinc-500 space-y-1 pl-2">
                        <li className={passwordData.newPass.length >= 8 ? "text-emerald-400" : ""}>
                          {passwordData.newPass.length >= 8 ? "✓" : "•"} At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(passwordData.newPass) ? "text-emerald-400" : ""}>
                          {/[A-Z]/.test(passwordData.newPass) ? "✓" : "•"} One uppercase letter (recommended)
                        </li>
                        <li className={/[0-9]/.test(passwordData.newPass) ? "text-emerald-400" : ""}>
                          {/[0-9]/.test(passwordData.newPass) ? "✓" : "•"} One number (recommended)
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordSaving || passwordData.newPass !== passwordData.confirm || passwordData.newPass.length < 8}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
                      >
                        {passwordSaving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="pt-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
                      <p className="text-xs text-muted-foreground">Secure your Ghostal creator account with an authenticator app (TOTP).</p>
                    </div>

                    {isLoadingMFA ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-500 py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                        Loading security credentials...
                      </div>
                    ) : isMFAEnabled ? (
                      <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">2FA is enabled and active</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                              Your account is guarded with Time-Based One-Time Password (TOTP) codes. Every login attempt must be verified.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end border-t border-white/5 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowDisableMFAModal(true)}
                            disabled={isMFADisabling}
                            className="flex items-center gap-2 rounded-lg bg-red-600/15 border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/25 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Disable Two-Factor Authentication
                          </button>
                        </div>
                      </div>
                    ) : isMFAEnrolling && mfaEnrollData ? (
                      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] p-6 space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                          <Sparkles className="h-4.5 w-4.5 text-violet-400" />
                          Set Up Authenticator
                        </div>

                        <div className="grid gap-6 md:grid-cols-5 items-center">
                          <div className="md:col-span-2 text-center bg-white p-3 rounded-xl max-w-[190px] mx-auto">
                            {mfaEnrollData.qrCode.startsWith("data:") ? (
                              <img src={mfaEnrollData.qrCode} alt="2FA QR Code" className="h-40 w-40 mx-auto" />
                            ) : (
                              <div 
                                className="h-40 w-40 mx-auto flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: mfaEnrollData.qrCode }}
                              />
                            )}
                          </div>
                          
                          <div className="md:col-span-3 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-foreground">Scan this QR Code</h4>
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                Open your authenticator app (Google Authenticator, Duo, or Microsoft Authenticator) and scan the QR code to connect your profile.
                              </p>
                            </div>

                            <div className="space-y-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-3 flex justify-between items-center group">
                              <div>
                                <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Fallback Secret Key</span>
                                <code className="text-xs font-mono text-violet-300 break-all select-all font-bold block">{mfaEnrollData.secret}</code>
                              </div>
                              <button type="button" onClick={handleCopySecret} className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-zinc-400 hover:text-white" title="Copy Secret">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={handleVerifyMFA} className="border-t border-white/5 pt-5 space-y-4">
                          <div className="space-y-2 max-w-sm">
                            <label className="text-xs font-semibold text-zinc-400">Enter Verification Code</label>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                value={mfaVerificationCode}
                                onChange={(e) => setMfaVerificationCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                className="flex-1 rounded-lg border border-white/5 bg-white/5 py-2 px-3.5 text-center text-sm font-semibold text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] tracking-widest transition-all"
                                required
                              />
                              <button
                                type="submit"
                                disabled={isMFAVerifying || mfaVerificationCode.length !== 6}
                                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
                              >
                                {isMFAVerifying ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  "Enable 2FA"
                                )}
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-500">6-digit passcode provided by your device app.</p>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleCancelMFAEnroll}
                              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel Setup
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">2FA is currently disabled</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                              Guard your assets and survival timers with a secondary verification passcode layer. Requires an authenticator device app.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end border-t border-white/5 pt-4">
                          <button
                            type="button"
                            onClick={handleStartMFAEnroll}
                            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer shadow-lg shadow-violet-500/10"
                          >
                            Enable Two-Factor Authentication
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* AI SURVIVAL TAB */}
              {activeTab === "ai" && (
                <form onSubmit={handleSaveAIConfig} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">AI Engine Configuration</h3>
                    <p className="text-xs text-muted-foreground">Customize the fallback strategy when queue empties.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        Autopilot Fallback Behavior
                      </label>
                      <select
                        value={formData.aiModel}
                        onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                        className="w-full rounded-lg border border-white/5 bg-[#12121a] py-2.5 px-3.5 text-sm text-white outline-none focus:border-violet-500/50 cursor-pointer"
                      >
                        <option className="bg-[#12121a] text-white" value="repost_evergreen">Repost Evergreen (No Modification)</option>
                        <option className="bg-[#12121a] text-white" value="remix_captions">AI Caption Remix (Rewrite old posts)</option>
                        <option className="bg-[#12121a] text-white" value="full_ai">Full Autopilot (Generate context from tags)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Inactivity Threshold</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <input
                          type="range"
                          min="1"
                          max="14"
                          value={formData.inactivityThreshold}
                          onChange={(e) => setFormData({ ...formData, inactivityThreshold: parseInt(e.target.value) })}
                          className="w-full h-1.5 rounded-lg bg-white/5 accent-violet-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1">
                          <input 
                            type="number"
                            min="1"
                            max="14"
                            value={formData.inactivityThreshold}
                            onChange={(e) => setFormData({ ...formData, inactivityThreshold: parseInt(e.target.value) || 1 })}
                            className="w-8 bg-transparent text-sm font-bold text-violet-400 outline-none text-right"
                          />
                          <span className="text-xs text-zinc-500 font-medium">Days</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500">Wait length after last post before Ghost Mode takes over.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Max Survival Posts per Week</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={formData.maxPosts}
                          onChange={(e) => setFormData({ ...formData, maxPosts: parseInt(e.target.value) })}
                          className="w-full h-1.5 rounded-lg bg-white/5 accent-violet-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1">
                          <input 
                            type="number"
                            min="1"
                            max="30"
                            value={formData.maxPosts}
                            onChange={(e) => setFormData({ ...formData, maxPosts: parseInt(e.target.value) || 1 })}
                            className="w-8 bg-transparent text-sm font-bold text-violet-400 outline-none text-right"
                          />
                          <span className="text-xs text-zinc-500 font-medium">Posts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Configuration"}
                    </button>
                  </div>
                </form>
              )}

              {/* BILLING & SUBSCRIPTIONS TAB */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-violet-400" />
                      Billing & Subscription
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Manage your plan, open your Paddle customer portal, or update payment details.
                    </p>
                  </div>

                  {/* Plan Overview Card */}
                  <div className="rounded-2xl border border-white/5 bg-[#12121a]/80 p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          Current Plan
                        </span>
                        <h4 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                          {billingData.plan === "lifetime" ? (
                            <>
                              <Crown className="h-5 w-5 text-amber-400" />
                              Founding Member (Lifetime)
                            </>
                          ) : billingData.plan === "survival_ai" ? (
                            <>
                              <Sparkles className="h-5 w-5 text-cyan-400" />
                              Survival AI
                            </>
                          ) : billingData.plan === "creator_pro" ? (
                            <>
                              <Zap className="h-5 w-5 text-violet-400" />
                              Creator Pro
                            </>
                          ) : billingData.plan === "starter" ? (
                            "Starter"
                          ) : (
                            "Free Plan"
                          )}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {billingData.plan === "lifetime" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
                            <Crown className="h-3.5 w-3.5" /> Lifetime Access
                          </span>
                        ) : billingData.subscription_status === "canceling" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400">
                            Canceling at Period End
                          </span>
                        ) : billingData.plan !== "free" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
                            <CheckCircle className="h-3.5 w-3.5" /> Active Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3.5 py-1 text-xs font-bold text-zinc-400">
                            Free Tier
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Billing Provider Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          Payment Provider
                        </span>
                        <p className="font-semibold text-white flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-violet-400" />
                          Paddle (Merchant of Record)
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Invoices and card transactions are processed securely by Paddle.
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          Subscription Reference
                        </span>
                        <p className="font-mono text-zinc-300 font-medium">
                          {billingData.paddle_subscription_id ||
                            (billingData.plan === "lifetime"
                              ? "One-time Purchase"
                              : "No recurring subscription")}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {billingData.paddle_customer_id
                            ? `Customer ID: ${billingData.paddle_customer_id}`
                            : "Billing ID assigned upon checkout."}
                        </p>
                      </div>
                    </div>

                    {/* Lifetime Notice */}
                    {billingData.plan === "lifetime" && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 flex items-start gap-3">
                        <Crown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">
                            Founding Member Status
                          </p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            You unlocked lifetime access to Ghostal. You have unlimited vault access, Ghost Mode Autopilot, and all upcoming features without any recurring renewal fees.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Customer Portal Button */}
                        <button
                          type="button"
                          onClick={handleOpenCustomerPortal}
                          disabled={openingPortal}
                          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                        >
                          {openingPortal ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Opening Portal...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open Customer Portal
                            </>
                          )}
                        </button>

                        {/* Upgrade Plan Button */}
                        {billingData.plan !== "lifetime" && billingData.plan !== "survival_ai" && (
                          <Link
                            href="/pricing"
                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            Change Plan
                          </Link>
                        )}
                      </div>

                      {/* Cancel Subscription Button */}
                      {billingData.plan !== "free" &&
                        billingData.plan !== "lifetime" &&
                        billingData.subscription_status !== "canceling" && (
                          <button
                            type="button"
                            onClick={handleCancelSubscription}
                            disabled={cancelingSub}
                            className="text-xs font-semibold text-red-400/80 hover:text-red-300 transition-colors cursor-pointer py-2 px-1 disabled:opacity-50"
                          >
                            {cancelingSub ? "Canceling..." : "Cancel Subscription"}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d0c18] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Account</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                This will permanently delete your authentication user and perform a cascade wipe of all database assets. This action cannot be undone. Are you absolutely sure?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDisableMFAModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d0c18] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <Shield className="h-5 w-5" />
                </div>
                <button onClick={() => setShowDisableMFAModal(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Disable 2FA</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Are you sure you want to disable Two-Factor Authentication? Your account will be significantly less secure without a secondary verification passcode layer.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDisableMFAModal(false)} disabled={isMFADisabling} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer">Cancel</button>
                <button onClick={handleDisableMFA} disabled={isMFADisabling} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer">
                  {isMFADisabling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable 2FA"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
