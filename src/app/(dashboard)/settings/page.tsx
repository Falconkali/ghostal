"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Instagram,
  Bell,
  Brain,
  CreditCard,
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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { GhostModeConfig } from "@/types";

export default function SettingsPage() {
  const { instagramConnected, instagramHandle, connectInstagram, disconnectInstagram, updateProfile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "profile" | "instagram" | "notifications" | "ai" | "security" | "billing"
  >("profile");

  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

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

  // Plan info from DB
  const [planInfo, setPlanInfo] = useState({
    name: "Starter",
    price: "Free",
    renewsAt: null as string | null,
  });

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
            .select("ghost_mode_config, notification_preferences, theme, plan, plan_expires_at")
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
            if (data.theme) {
              setTheme(data.theme);
              if (typeof window !== "undefined") {
                const root = window.document.documentElement;
                if (data.theme === "light") {
                  root.classList.remove("dark");
                } else {
                  root.classList.add("dark");
                }
              }
            }
            // Load plan info
            const planMap: Record<string, { name: string; price: string }> = {
              starter: { name: "Starter", price: "Free" },
              creator_pro: { name: "Creator Pro", price: "$29/mo" },
              survival_ai: { name: "Survival AI", price: "$59/mo" },
            };
            const planKey = (data.plan || "starter") as string;
            const planDetails = planMap[planKey] || planMap["starter"];
            setPlanInfo({
              name: planDetails.name,
              price: planDetails.price,
              renewsAt: data.plan_expires_at || null,
            });
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

    setPasswordSaving(true);
    setErrorMessage(null);
    try {
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
        issuer: "GhostFlow",
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
    const confirmDisable = window.confirm(
      "WARNING: Are you sure you want to disable Two-Factor Authentication? Your account will be significantly less secure."
    );
    if (!confirmDisable) return;

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
      const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || "871648842633489";
      const redirectUri = `${window.location.origin}/api/auth/instagram/callback`;
      const scope = "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_content_publish";
      const oauthUrl = `https://www.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
      
      window.location.href = oauthUrl;
    }
  };

  // Toggle Notification Preference
  const toggleNotificationPref = async (key: "starvation" | "activation" | "report") => {
    if (!user) return;
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
    }
  };

  // Toggle Dark/Light Theme
  const toggleTheme = async () => {
    if (!user) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (newTheme === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: newTheme })
        .eq("id", user.id);
      
      if (error) throw error;
      setSuccessMessage("Theme updated successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      console.error("Error saving theme:", err);
      setErrorMessage(err.message || "Failed to update theme.");
      setTimeout(() => setErrorMessage(null), 3000);
      // Rollback UI
      setTheme(theme);
      if (typeof window !== "undefined") {
        const root = window.document.documentElement;
        if (theme === "light") {
          root.classList.remove("dark");
        } else {
          root.classList.add("dark");
        }
      }
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmDelete = window.confirm(
      "WARNING: Are you absolutely sure you want to permanently delete your account? This will erase all your vault items, scheduled posts, AI survival profiles, and profile data completely. This cannot be undone."
    );
    
    if (!confirmDelete) return;
    
    const finalConfirm = window.confirm(
      "Final Confirmation: This will delete your authentication user from Supabase and perform a cascade wipe of all database assets. Click OK to proceed."
    );
    
    if (!finalConfirm) return;
    
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
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "instagram", label: "Instagram Link", icon: Instagram },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "ai", label: "AI Survival", icon: Brain },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Plan & Billing", icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-zinc-400">
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
                    <h3 className="text-lg font-semibold text-white">Profile Details</h3>
                    <p className="text-xs text-zinc-400">Update your avatar, display name, and email address.</p>
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
                      Permanently delete your GhostFlow account and erase all data. This action is irreversible.
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">Delete Account</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">All scheduled posts, media files, and profiles will be deleted instantly.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </>
            )}

              {/* INSTAGRAM TAB */}
              {activeTab === "instagram" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Instagram Integration</h3>
                    <p className="text-xs text-zinc-400">Configure connection to your Instagram Professional/Creator account.</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col gap-5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600/10 text-pink-400 border border-pink-500/10 shrink-0">
                        <Instagram className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
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
                    <h3 className="text-lg font-semibold text-white">Alert Preferences</h3>
                    <p className="text-xs text-zinc-400">Configure how and when GhostFlow reaches you.</p>
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
                            <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={notificationPrefs[item.id]}
                            onChange={() => toggleNotificationPref(item.id)}
                            className="peer sr-only"
                          />
                          <div className="peer h-5 w-9 rounded-full bg-white/5 border border-white/10 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-zinc-400 after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:outline-none" />
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Appearance Section */}
                  <div className="border-t border-white/5 pt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Appearance</h3>
                      <p className="text-xs text-zinc-400">Choose between light and dark modes.</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => theme !== "light" && toggleTheme()}
                        className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl border p-4 text-sm font-medium transition-all cursor-pointer ${
                          theme === "light"
                            ? "bg-white/10 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Sun className="h-4.5 w-4.5 text-amber-400" />
                        Light Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => theme !== "dark" && toggleTheme()}
                        className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl border p-4 text-sm font-medium transition-all cursor-pointer ${
                          theme === "dark"
                            ? "bg-white/10 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Moon className="h-4.5 w-4.5 text-violet-400" />
                        Dark Mode
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-8 divide-y divide-white/5">
                  {/* Change Password */}
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Change Password</h3>
                      <p className="text-xs text-zinc-400">Update your account password. Must be at least 8 characters.</p>
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
                      <h3 className="text-lg font-semibold text-white">Two-Factor Authentication (2FA)</h3>
                      <p className="text-xs text-zinc-400">Secure your GhostFlow creator account with an authenticator app (TOTP).</p>
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
                            <h4 className="text-sm font-bold text-white">2FA is enabled and active</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                              Your account is guarded with Time-Based One-Time Password (TOTP) codes. Every login attempt must be verified.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end border-t border-white/5 pt-4">
                          <button
                            type="button"
                            onClick={handleDisableMFA}
                            disabled={isMFADisabling}
                            className="flex items-center gap-2 rounded-lg bg-red-600/15 border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/25 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isMFADisabling ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Disabling...
                              </>
                            ) : (
                              "Disable Two-Factor Authentication"
                            )}
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
                              <h4 className="text-sm font-semibold text-white">Scan this QR Code</h4>
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                Open your authenticator app (Google Authenticator, Duo, or Microsoft Authenticator) and scan the QR code to connect your profile.
                              </p>
                            </div>

                            <div className="space-y-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Fallback Secret Key</span>
                              <code className="text-xs font-mono text-violet-300 break-all select-all font-bold block">{mfaEnrollData.secret}</code>
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
                            <h4 className="text-sm font-bold text-white">2FA is currently disabled</h4>
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
                    <h3 className="text-lg font-semibold text-white">AI Engine Configuration</h3>
                    <p className="text-xs text-zinc-400">Customize the fallback strategy when queue empties.</p>
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
                        <span className="text-violet-400 font-bold">{formData.inactivityThreshold} Days</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={formData.inactivityThreshold}
                        onChange={(e) => setFormData({ ...formData, inactivityThreshold: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-lg bg-white/5 accent-violet-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-500">Wait length after last post before Ghost Mode takes over.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Max Survival Posts per Week</span>
                        <span className="text-violet-400 font-bold">{formData.maxPosts} Posts</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.maxPosts}
                        onChange={(e) => setFormData({ ...formData, maxPosts: parseInt(e.target.value) })}
                        className="w-full h-1.5 rounded-lg bg-white/5 accent-violet-600 cursor-pointer"
                      />
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

              {/* BILLING TAB */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Plan Overview</h3>
                    <p className="text-xs text-zinc-400">Manage your subscription and view usage limits.</p>
                  </div>

                  {/* Current Plan */}
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400 uppercase">
                        Current Plan
                      </span>
                      {isLoadingProfile ? (
                        <div className="mt-2 space-y-2">
                          <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
                          <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
                        </div>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-white mt-1">{planInfo.name}</h4>
                          <p className="text-xs text-zinc-400">
                            {planInfo.price === "Free" ? "Free plan" : `${planInfo.price}`}
                            {planInfo.renewsAt
                              ? ` · renews ${new Date(planInfo.renewsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                              : ""}
                          </p>
                        </>
                      )}
                    </div>
                    {planInfo.name !== "Survival AI" && (
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        <button
                          id="billing-upgrade-btn"
                          disabled={upgrading}
                          onClick={async () => {
                            setUpgrading(true);
                            setErrorMessage(null);
                            try {
                              if (!user) throw new Error("User session not found.");
                              const targetPlan = planInfo.name === "Starter" ? "creator_pro" : "survival_ai";
                              const { error } = await supabase
                                .from("profiles")
                                .update({ plan: targetPlan })
                                .eq("id", user.id);
                              if (error) throw error;
                              setPlanInfo({
                                name: targetPlan === "creator_pro" ? "Creator Pro" : "Survival AI",
                                price: targetPlan === "creator_pro" ? "$29/mo" : "$59/mo",
                                renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                              });
                              setSuccessMessage(`Successfully upgraded to ${targetPlan === "creator_pro" ? "Creator Pro" : "Survival AI"} (Sandbox Mode)!`);
                              setTimeout(() => setSuccessMessage(null), 4000);
                            } catch (err: any) {
                              setErrorMessage(err.message || "Could not upgrade plan. Please try again.");
                              setTimeout(() => setErrorMessage(null), 6000);
                            } finally {
                              setUpgrading(false);
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-violet-500/20 disabled:opacity-60"
                        >
                          {upgrading ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting...</>
                          ) : (
                            planInfo.name === "Starter" ? "Upgrade to Creator Pro" : "Upgrade to Survival AI"
                          )}
                        </button>
                        <p className="text-[10px] text-zinc-500">No commitment · cancel anytime</p>
                      </div>
                    )}
                  </div>

                  {/* Plan Feature Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">What&apos;s Included</h4>
                    <div className="rounded-xl border border-white/5 divide-y divide-white/5">
                      {[
                        { feature: "Content Vault", starter: "50 assets", pro: "500 assets", ai: "Unlimited" },
                        { feature: "Scheduled Posts", starter: "10/month", pro: "Unlimited", ai: "Unlimited" },
                        { feature: "Ghost Mode", starter: "—", pro: "✓", ai: "✓ Advanced" },
                        { feature: "AI Survival Refill", starter: "—", pro: "Basic", ai: "Full Autopilot" },
                        { feature: "Analytics", starter: "7 days", pro: "90 days", ai: "Full history" },
                      ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-4 px-4 py-3 text-xs">
                          <span className="font-medium text-zinc-300">{row.feature}</span>
                          <span className={planInfo.name === "Starter" ? "text-white font-semibold" : "text-zinc-500"}>{row.starter}</span>
                          <span className={planInfo.name === "Creator Pro" ? "text-violet-400 font-semibold" : "text-zinc-500"}>{row.pro}</span>
                          <span className={planInfo.name === "Survival AI" ? "text-cyan-400 font-semibold" : "text-zinc-500"}>{row.ai}</span>
                        </div>
                      ))}
                      <div className="grid grid-cols-4 px-4 py-2 text-[10px] text-zinc-600 bg-white/[0.01]">
                        <span />
                        <span className={planInfo.name === "Starter" ? "text-violet-400 font-bold" : ""}>Starter</span>
                        <span className={planInfo.name === "Creator Pro" ? "text-violet-400 font-bold" : ""}>Creator Pro</span>
                        <span className={planInfo.name === "Survival AI" ? "text-cyan-400 font-bold" : ""}>Survival AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
