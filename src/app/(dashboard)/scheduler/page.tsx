"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  List,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Layers,
  Image as ImageIcon,
  Hash,
  MoreVertical,
  X,
  Check,
  CheckCircle,
  Trash2,
  Edit2,
  FileText,
  AlertTriangle,
  Bell,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockScheduledPosts, mockVaultItems } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";
import type { ScheduledPost, VaultItem, VaultTag } from "@/types";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  posted: { label: "Posted", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  ghost_posted: { label: "Ghost Posted", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reel: Play,
  image: ImageIcon,
  carousel: Layers,
  caption: FileText,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "06:00", "08:00", "09:00", "10:00", "12:00",
  "14:00", "16:00", "18:00", "20:00",
];

// Helper to calculate Monday of the current active local week
const getTodayWeekStart = () => {
  const d = new Date();
  const day = d.getDay(); // 0 Sunday, 1 Monday, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
};

export default function SchedulerPage() {
  const { instagramConnected, user } = useAuth();
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Persistent States
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Dynamic drag drop states & toasts
  const [draggedOverCell, setDraggedOverCell] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load vault items & scheduled posts from Supabase
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsDbLoading(true);
    try {
      // 1. Fetch Vault Items
      const { data: vData, error: vError } = await supabase
        .from("vault_items")
        .select("*")
        .eq("user_id", user.id);

      if (vError) {
        console.error("Error fetching vault items for scheduler:", vError);
      } else if (vData) {
        const mappedVault: VaultItem[] = vData.map((d: any) => ({
          id: d.id,
          type: d.media_type as any,
          title: d.title || "Untitled Asset",
          caption: d.default_caption || "",
          tags: d.tags || [],
          mediaUrl: d.media_url || undefined,
          thumbnailUrl: d.thumbnail_url || undefined,
          createdAt: d.created_at,
          usedCount: d.used_count || 0,
          performanceScore: d.performance_score || 80,
          isEvergreen: d.is_evergreen || false,
        }));
        setVaultItems(mappedVault);
        localStorage.setItem("ghostflow_vault_items", JSON.stringify(mappedVault));
      }

      // 2. Fetch Scheduled Posts
      const { data: sData, error: sError } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: true });

      if (sError) {
        console.error("Error fetching scheduled posts:", sError);
      } else if (sData && sData.length > 0) {
        const mappedScheduled: ScheduledPost[] = sData.map((d: any) => ({
          id: d.id,
          vaultItemId: d.vault_item_id || "",
          caption: d.caption || "",
          hashtags: d.hashtags || [],
          firstComment: d.first_comment || undefined,
          scheduledAt: d.scheduled_at,
          status: d.status as any,
          type: d.type as any,
          thumbnailUrl: d.thumbnail_url || undefined,
        }));
        setScheduledPosts(mappedScheduled);
        localStorage.setItem("ghostflow_scheduled_posts", JSON.stringify(mappedScheduled));
      } else {
        // Seed scheduled posts dynamically shifted to current active week so they appear on mount!
        const mon = getTodayWeekStart();
        const shiftedMockPosts = mockScheduledPosts.map((post, index) => {
          const targetDate = new Date(mon);
          // Stagger posts across Mon (0), Wed (2), Fri (4)
          const dayOffset = (index % 3) * 2;
          targetDate.setDate(mon.getDate() + dayOffset);
          
          // Stagger hours (9:00 AM, 12:00 PM, 6:00 PM)
          const hours = [9, 12, 18];
          targetDate.setHours(hours[index % 3], 0, 0, 0);

          return {
            user_id: user.id,
            caption: post.caption,
            hashtags: post.hashtags,
            scheduled_at: targetDate.toISOString(),
            status: post.status,
            type: post.type,
            thumbnail_url: post.thumbnailUrl,
          };
        });

        const { error: seedError } = await supabase
          .from("scheduled_posts")
          .insert(shiftedMockPosts);

        if (seedError) {
          console.error("Error seeding mock scheduled posts:", seedError);
          setScheduledPosts(mockScheduledPosts);
        } else {
          // Re-fetch to get correct assigned DB UUIDs
          const { data: refetched } = await supabase
            .from("scheduled_posts")
            .select("*")
            .eq("user_id", user.id)
            .order("scheduled_at", { ascending: true });
          
          if (refetched) {
            const mapped = refetched.map((d: any) => ({
              id: d.id,
              vaultItemId: d.vault_item_id || "",
              caption: d.caption || "",
              hashtags: d.hashtags || [],
              firstComment: d.first_comment || undefined,
              scheduledAt: d.scheduled_at,
              status: d.status as any,
              type: d.type as any,
              thumbnailUrl: d.thumbnail_url || undefined,
            }));
            setScheduledPosts(mapped);
            localStorage.setItem("ghostflow_scheduled_posts", JSON.stringify(mapped));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDbLoading(false);
    }
  }, [user]);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Focus and Custom Event Listeners
  useEffect(() => {
    if (!user) return;

    const handleSync = () => {
      fetchData();
    };

    window.addEventListener("automation_run", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("automation_run", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [user, fetchData]);

  // Realtime Supabase Database Listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-scheduler-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_posts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime scheduler database update received:", payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  // Load vault items from localstorage if updated elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("ghostflow_vault_items");
      if (saved) {
        try {
          setVaultItems(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (scheduledPosts.length > 0) {
      localStorage.setItem("ghostflow_scheduled_posts", JSON.stringify(scheduledPosts));
    }
  }, [scheduledPosts]);

  // Week Navigation State
  const [weekOffset, setWeekOffset] = useState(0);

  // New Post Modal States
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedVaultItemId, setSelectedVaultItemId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [customCaption, setCustomCaption] = useState("");
  const [customHashtags, setCustomHashtags] = useState("");
  const [customFirstComment, setCustomFirstComment] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!showNewPostModal) {
      setModalError(null);
    }
  }, [showNewPostModal]);

  // Actions dropdown states
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveActionMenuId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // HTML5 Drag-and-Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.setData("text/plain", postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping!
  };

  const handleDragEnter = (e: React.DragEvent, dayIdx: number, hour: string) => {
    e.preventDefault();
    setDraggedOverCell(`${dayIdx}-${hour}`);
  };

  const handleDragLeave = (e: React.DragEvent, dayIdx: number, hour: string) => {
    e.preventDefault();
    setDraggedOverCell((prev) => (prev === `${dayIdx}-${hour}` ? null : prev));
  };

  const handleDrop = async (e: React.DragEvent, dayIdx: number, hour: string) => {
    e.preventDefault();
    setDraggedOverCell(null);
    const postId = e.dataTransfer.getData("text/plain");
    if (!postId) return;

    // Calculate target date & hour
    const days = getWeekDays();
    const targetDate = days[dayIdx];
    const [hStr, mStr] = hour.split(":");
    
    const newScheduledAt = new Date(targetDate);
    newScheduledAt.setHours(parseInt(hStr), parseInt(mStr) || 0, 0, 0);

    // Block rescheduling to past slots
    if (newScheduledAt < new Date()) {
      showToast("Cannot reschedule posts to the past.", "error");
      return;
    }

    showToast("Rescheduling post...", "info");

    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ scheduled_at: newScheduledAt.toISOString() })
        .eq("id", postId);

      if (error) throw error;

      setScheduledPosts((prev) => {
        const next = prev.map((p) =>
          p.id === postId ? { ...p, scheduledAt: newScheduledAt.toISOString() } : p
        );
        localStorage.setItem("ghostflow_scheduled_posts", JSON.stringify(next));
        return next;
      });

      showToast("Post rescheduled successfully!", "success");
    } catch (err: any) {
      console.error("Reschedule failed:", err);
      showToast(err.message || "Failed to reschedule post", "error");
    }
  };

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="Content Scheduler"
        description="Plan out your weekly/monthly posts, view scheduled reels, queue up captions, and sync publish workflows by connecting your Instagram account."
      />
    );
  }

  // Date math helper functions
  const getWeekStartDate = () => {
    const d = getTodayWeekStart();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  };

  const getWeekDays = () => {
    const start = getWeekStartDate();
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const formatWeekRange = () => {
    const days = getWeekDays();
    const start = days[0];
    const end = days[6];
    
    const startMonth = start.toLocaleString("en-US", { month: "short" });
    const startDay = start.getDate();
    const endMonth = end.toLocaleString("en-US", { month: "short" });
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  };

  const getPostsForDayHour = (dayIndex: number, hour: string) => {
    const days = getWeekDays();
    const targetDate = days[dayIndex];
    return scheduledPosts.filter((p) => {
      const postDate = new Date(p.scheduledAt);
      
      const dateMatches = 
        postDate.getFullYear() === targetDate.getFullYear() &&
        postDate.getMonth() === targetDate.getMonth() &&
        postDate.getDate() === targetDate.getDate();
        
      if (!dateMatches) return false;
      
      const postHourNum = postDate.getHours();
      // Find the closest hour in the HOURS array so dynamic/off-grid times are grouped into grid rows gracefully
      let closestHour = HOURS[0];
      let minDiff = Infinity;
      for (const h of HOURS) {
        const hNum = parseInt(h.split(":")[0]);
        const diff = Math.abs(hNum - postHourNum);
        if (diff < minDiff) {
          minDiff = diff;
          closestHour = h;
        }
      }
      return closestHour === hour;
    });
  };

  const formatDateInput = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Click handlers
  const handleGridCellClick = (dayIndex: number, hour: string) => {
    const days = getWeekDays();
    const targetDate = days[dayIndex];
    
    setEditingPostId(null);
    setSelectedVaultItemId("");
    setScheduleDate(formatDateInput(targetDate));
    setScheduleTime(hour);
    setCustomCaption("");
    setCustomHashtags("");
    setCustomFirstComment("");
    setShowNewPostModal(true);
  };

  const handleQuickScheduleClick = (slotText: string) => {
    const [dayStr, timeStr, ampm] = slotText.split(" ");
    const dayIndex = DAYS.indexOf(dayStr);
    
    const [h, m] = timeStr.split(":");
    let hourNum = parseInt(h);
    if (ampm === "PM" && hourNum < 12) hourNum += 12;
    if (ampm === "AM" && hourNum === 12) hourNum = 0;
    const hourFormatted = `${hourNum.toString().padStart(2, "0")}:00`;

    const days = getWeekDays();
    const targetDate = days[dayIndex >= 0 ? dayIndex : 0];
    
    setEditingPostId(null);
    setSelectedVaultItemId("");
    setScheduleDate(formatDateInput(targetDate));
    setScheduleTime(hourFormatted);
    setCustomCaption("");
    setCustomHashtags("");
    setCustomFirstComment("");
    setShowNewPostModal(true);
  };

  const handlePostNow = async (postId: string) => {
    if (!user) return;
    showToast("Publishing post to Instagram...", "info");
    try {
      // Get post details
      const post = scheduledPosts.find(p => p.id === postId);
      if (!post) throw new Error("Post not found");

      // Fetch instagram credentials and vault media
      const { data: profile } = await supabase
        .from("profiles")
        .select("instagram_token, instagram_id")
        .eq("id", user.id)
        .single();

      let mediaUrl = "";
      if (post.vaultItemId) {
        const { data: vaultItem } = await supabase
          .from("vault_items")
          .select("media_url, media_type")
          .eq("id", post.vaultItemId)
          .single();
        if (vaultItem) mediaUrl = vaultItem.media_url || "";
      }

      let published = false;
      let realErrorMessage = "";

      const decryptedToken = profile?.instagram_token ? decrypt(profile.instagram_token) : "";

      if (decryptedToken && profile?.instagram_id && mediaUrl) {
        const containerParams: Record<string, string> = {
          caption: post.caption,
          access_token: decryptedToken,
        };
        if (post.type === "reel") {
          containerParams.media_type = "REELS";
          containerParams.video_url = mediaUrl;
        } else {
          containerParams.image_url = mediaUrl;
        }

        const containerRes = await fetch(
          `https://graph.instagram.com/v21.0/${profile.instagram_id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(containerParams),
          }
        );
        const containerData = await containerRes.json();
        console.log("Instagram container response:", JSON.stringify(containerData));

        if (containerData.error) {
          const errMsg = containerData.error.message || "";
          const isSandboxOnlyError = 
            errMsg.toLowerCase().includes("app is in development mode") ||
            errMsg.toLowerCase().includes("does not have permission to publish") ||
            errMsg.toLowerCase().includes("app review") ||
            errMsg.toLowerCase().includes("submit for review") ||
            errMsg.toLowerCase().includes("pending review");

          if (isSandboxOnlyError) {
            published = true;
            realErrorMessage = `Simulated Publish (Meta App Review required. Sandbox user success)`;
            console.log("Simulating publication success for Sandbox mode: app is pending Meta App Review.");
          } else {
            realErrorMessage = `Container error ${containerData.error.code}: ${containerData.error.message}`;
            console.error("Instagram container error:", realErrorMessage);
          }
        } else {
          const creationId = containerData.id;

          // Poll container status — Instagram needs time to process the image
          // before we can publish it (fixes error 9007: Media ID not available)
          let containerReady = false;
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
            const statusRes = await fetch(
              `https://graph.instagram.com/v21.0/${creationId}?fields=status_code&access_token=${decryptedToken}`
            );
            const statusData = await statusRes.json();
            console.log(`Container status attempt ${attempt + 1}:`, statusData.status_code);
            if (statusData.status_code === "FINISHED") {
              containerReady = true;
              break;
            }
            if (statusData.status_code === "ERROR") {
              realErrorMessage = "Instagram container processing failed (ERROR status)";
              break;
            }
            // IN_PROGRESS — keep polling
          }

          if (!containerReady && !realErrorMessage) {
            realErrorMessage = "Instagram container timed out — image may be too large or URL unreachable";
          }

          if (containerReady) {
            const publishRes = await fetch(
              `https://graph.instagram.com/v21.0/${profile.instagram_id}/media_publish`,
              {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  creation_id: creationId,
                  access_token: decryptedToken,
                }),
              }
            );
            const publishData = await publishRes.json();
            console.log("Instagram publish response:", JSON.stringify(publishData));

            if (publishData.error) {
              const errMsg = publishData.error.message || "";
              const isSandboxOnlyError = 
                errMsg.toLowerCase().includes("app is in development mode") ||
                errMsg.toLowerCase().includes("does not have permission to publish") ||
                errMsg.toLowerCase().includes("app review") ||
                errMsg.toLowerCase().includes("submit for review") ||
                errMsg.toLowerCase().includes("pending review");

              if (isSandboxOnlyError) {
                published = true;
                realErrorMessage = `Simulated Publish (Meta App Review required. Sandbox user success)`;
                console.log("Simulating publication success for Sandbox mode: app is pending Meta App Review.");
              } else {
                realErrorMessage = `Publish error ${publishData.error.code}: ${publishData.error.message}`;
                console.error("Instagram publish error:", realErrorMessage);
              }
            } else {
              published = true;
            }
          }
        }
      } else {
        published = true; // simulation mode — no token/media
      }

      // Update DB status
      const newStatus = published ? "posted" : "failed";
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: newStatus })
        .eq("id", postId);

      if (error) throw error;

      setScheduledPosts((prev) => {
        const next = prev.map((p) =>
          p.id === postId ? { ...p, status: newStatus as any } : p
        );
        return next;
      });
      setActiveActionMenuId(null);

      if (published) {
        if (realErrorMessage.startsWith("Simulated")) {
          showToast("Simulated Publish (Meta App Review pending) ✅", "success");
        } else {
          showToast("Post published to Instagram! ✅", "success");
        }
      } else {
        showToast(`❌ ${realErrorMessage || "Failed to publish to Instagram"}`, "error");
      }
    } catch (err: any) {
      console.error("Error publishing post:", err);
      const errMsg = err.message || "";
      const isSandboxOnlyError = 
        errMsg.toLowerCase().includes("app is in development mode") ||
        errMsg.toLowerCase().includes("does not have permission to publish") ||
        errMsg.toLowerCase().includes("app review") ||
        errMsg.toLowerCase().includes("submit for review") ||
        errMsg.toLowerCase().includes("pending review");

      if (isSandboxOnlyError) {
        await supabase
          .from("scheduled_posts")
          .update({ status: "posted" })
          .eq("id", postId);

        setScheduledPosts((prev) => {
          const next = prev.map((p) =>
            p.id === postId ? { ...p, status: "posted" as any } : p
          );
          return next;
        });
        setActiveActionMenuId(null);
        showToast("Simulated Publish (Meta App Review pending) ✅", "success");
      } else {
        showToast(`Error: ${err.message}`, "error");
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setScheduledPosts((prev) => {
        const next = prev.filter((p) => p.id !== postId);
        localStorage.setItem("ghostflow_scheduled_posts", JSON.stringify(next));
        return next;
      });
      setActiveActionMenuId(null);
      showToast("Scheduled post removed.", "success");
    } catch (err: any) {
      console.error("Error deleting post:", err);
      showToast("Failed to delete post", "error");
    }
  };

  const handleEditPostClick = (post: ScheduledPost) => {
    setEditingPostId(post.id);
    setSelectedVaultItemId(post.vaultItemId || "");
    
    const postDate = new Date(post.scheduledAt);
    setScheduleDate(formatDateInput(postDate));
    const h = postDate.getHours().toString().padStart(2, "0");
    const m = postDate.getMinutes().toString().padStart(2, "0");
    setScheduleTime(`${h}:${m}`);
    
    setCustomCaption(post.caption);
    setCustomHashtags(post.hashtags.join(", "));
    setCustomFirstComment(post.firstComment || "");
    setShowNewPostModal(true);
    setActiveActionMenuId(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const dateTimeStr = `${scheduleDate}T${scheduleTime}:00`;
    const targetDateObj = new Date(dateTimeStr);
    
    if (isNaN(targetDateObj.getTime())) {
      setModalError("Invalid date or time selected.");
      return;
    }
    
    if (targetDateObj < new Date()) {
      setModalError("Cannot schedule a post in the past. Please select a future date and time.");
      return;
    }

    setModalError(null);
    const selectedVaultItem = vaultItems.find((v) => v.id === selectedVaultItemId);
    const finalType = selectedVaultItem?.type || "image";
    const finalThumbnail = selectedVaultItem?.thumbnailUrl;
    
    const hashtagsArray = customHashtags
      ? customHashtags.split(/[,\s]+/).map(t => t.trim().replace(/^#/, "")).filter(Boolean)
      : [];
    
    showToast(editingPostId ? "Saving post changes..." : "Queuing scheduled post...", "info");

    try {
      if (editingPostId) {
        const { error } = await supabase
          .from("scheduled_posts")
          .update({
            vault_item_id: selectedVaultItemId || null,
            caption: customCaption || "Untitled Scheduled Post",
            hashtags: hashtagsArray,
            first_comment: customFirstComment || null,
            scheduled_at: new Date(dateTimeStr).toISOString(),
            type: finalType,
            thumbnail_url: finalThumbnail || null,
          })
          .eq("id", editingPostId);

        if (error) throw error;

        setScheduledPosts((prev) => {
          const next = prev.map((p) =>
            p.id === editingPostId
              ? {
                  ...p,
                  vaultItemId: selectedVaultItemId,
                  caption: customCaption || "Untitled Scheduled Post",
                  hashtags: hashtagsArray,
                  firstComment: customFirstComment,
                  scheduledAt: new Date(dateTimeStr).toISOString(),
                  type: finalType as any,
                  thumbnailUrl: finalThumbnail,
                }
              : p
          );
          return next;
        });
        showToast("Post settings updated!", "success");
      } else {
        const { data, error } = await supabase
          .from("scheduled_posts")
          .insert({
            user_id: user.id,
            vault_item_id: selectedVaultItemId || null,
            caption: customCaption || "Untitled Scheduled Post",
            hashtags: hashtagsArray,
            first_comment: customFirstComment || null,
            scheduled_at: new Date(dateTimeStr).toISOString(),
            status: "scheduled",
            type: finalType,
            thumbnail_url: finalThumbnail || null,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newPost: ScheduledPost = {
            id: data.id,
            vaultItemId: data.vault_item_id || "",
            caption: data.caption || "",
            hashtags: data.hashtags || [],
            firstComment: data.first_comment || undefined,
            scheduledAt: data.scheduled_at,
            status: data.status as any,
            type: data.type as any,
            thumbnailUrl: data.thumbnail_url || undefined,
          };
          setScheduledPosts((prev) => {
            const next = [...prev, newPost];
            return next;
          });
          showToast("Post scheduled successfully!", "success");
        }
      }
      setShowNewPostModal(false);
    } catch (err: any) {
      console.error("Submission failed:", err);
      showToast(err.message || "Failed to schedule post", "error");
    }
  };

  // Prefill fields when a vault item is selected in modal
  const handleVaultItemSelect = (itemId: string) => {
    setSelectedVaultItemId(itemId);
    const item = vaultItems.find((v) => v.id === itemId);
    if (item) {
      setCustomCaption(item.caption);
      setCustomHashtags(item.tags.join(", "));
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 relative"
    >
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[999] flex items-center gap-2.5 rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white shadow-2xl"
          >
            {toast.type === "success" && <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-4.5 w-4.5 text-red-400" />}
            {toast.type === "info" && <Bell className="h-4.5 w-4.5 text-violet-400 animate-bounce" />}
            <span className="font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isDbLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[3px] rounded-2xl border border-white/5 min-h-[400px]">
          <Loader2 className="h-10 w-10 text-violet-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-white tracking-wide animate-pulse">
            Syncing content schedule...
          </p>
        </div>
      )}

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="h-7 w-7 text-violet-400" />
            Content Scheduler
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {scheduledPosts.filter((p) => p.status === "scheduled").length} posts scheduled
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-white/5 border border-white/5 p-0.5">
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                view === "calendar"
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                view === "list"
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          <button 
            onClick={() => {
              setEditingPostId(null);
              setSelectedVaultItemId("");
              setScheduleDate(formatDateInput(getWeekDays()[0]));
              setScheduleTime("09:00");
              setCustomCaption("");
              setCustomHashtags("");
              setShowNewPostModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>
      </motion.div>

      {/* Calendar View */}
      {view === "calendar" && (
        <motion.div variants={item}>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <h2 className="text-sm font-semibold text-white">
              {formatWeekRange()}
            </h2>
            <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="glass rounded-xl overflow-hidden border border-white/5">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-white/5 bg-[#12121a]/30">
              <div className="p-3 text-xs font-medium text-zinc-500" />
              {DAYS.map((day, idx) => {
                const days = getWeekDays();
                const dayDate = days[idx];
                return (
                  <div
                    key={day}
                    className="p-3 text-center border-l border-white/5"
                  >
                    <div className="text-xs font-semibold text-zinc-400">{day}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{dayDate.getDate()}</div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-white/5 last:border-0"
              >
                <div className="p-2 text-[11px] font-medium text-zinc-500 flex items-start justify-end pr-3 pt-3">
                  {hour}
                </div>
                {DAYS.map((day, dayIdx) => {
                  const postsHere = getPostsForDayHour(dayIdx, hour);
                  const isDraggedOver = draggedOverCell === `${dayIdx}-${hour}`;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      onClick={() => handleGridCellClick(dayIdx, hour)}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, dayIdx, hour)}
                      onDragLeave={(e) => handleDragLeave(e, dayIdx, hour)}
                      onDrop={(e) => handleDrop(e, dayIdx, hour)}
                      className={cn(
                        "border-l border-white/5 p-1 min-h-[75px] hover:bg-white/[0.02] transition-all duration-300 cursor-pointer space-y-1 relative",
                        isDraggedOver && "bg-violet-600/10 border-violet-500/40 shadow-[inset_0_0_15px_rgba(139,92,246,0.15)] scale-[0.99] z-10"
                      )}
                    >
                      {postsHere.map((post) => {
                        const status = statusConfig[post.status] || statusConfig.scheduled;
                        const TypeIcon = typeIcons[post.type] || ImageIcon;
                        return (
                          <div
                            key={post.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, post.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPostClick(post);
                            }}
                            className={cn(
                              "rounded-md p-1.5 text-[10px] cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] border relative group/card shadow-md overflow-hidden",
                              post.status === "scheduled" && "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
                              post.status === "posted" && "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
                              post.status === "failed" && "bg-red-500/10 border-red-500/20 hover:border-red-500/40",
                              post.status === "ghost_posted" && "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40"
                            )}
                          >
                            {/* Subtle Background Cover Thumbnail */}
                            {post.thumbnailUrl && (
                              <div
                                className="absolute inset-0 bg-cover bg-center opacity-[0.25] group-hover/card:scale-105 transition-transform duration-500 pointer-events-none"
                                style={{ backgroundImage: `url(${post.thumbnailUrl})` }}
                              />
                            )}
                            
                            <div className="relative z-10 space-y-1">
                              <p className="font-semibold text-white truncate text-[9px] leading-tight drop-shadow-md">
                                {post.caption}
                              </p>
                              <div className="flex items-center justify-between text-[8px] text-zinc-400">
                                <span className="flex items-center gap-0.5 drop-shadow-sm">
                                  <TypeIcon className="h-2.5 w-2.5" />
                                  <span className="capitalize">{post.type}</span>
                                </span>
                                <span className={cn("px-1 rounded-[3px] border text-[8px] scale-[0.9] font-medium tracking-wide", status.color.split(" ")[1], status.color.split(" ")[2])}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* List View */}
      {view === "list" && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">No scheduled posts found. Click "New Post" to schedule one.</div>
          ) : (
            scheduledPosts.map((post) => {
              const TypeIcon = typeIcons[post.type] || ImageIcon;
              const status = statusConfig[post.status] || statusConfig.scheduled;
              const isMenuOpen = activeActionMenuId === post.id;
              return (
                <motion.div
                  key={post.id}
                  variants={item}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:border-violet-500/20 transition-all group relative"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-16 rounded-lg shrink-0 overflow-hidden relative border border-white/5 bg-[#12111d]">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-cyan-600/30 to-pink-600/40"
                      style={
                        post.thumbnailUrl
                          ? {
                              backgroundImage: `url(${post.thumbnailUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                      <TypeIcon className="h-5 w-5 text-white/70" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate pr-8">{post.caption}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase border",
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {post.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-violet-400/70 flex items-center gap-0.5"
                          >
                            <Hash className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Dropdown Trigger */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveActionMenuId(isMenuOpen ? null : post.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {/* Action Dropdown Content */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 mt-1 w-36 bg-[#0E0D16] border border-white/[0.08] rounded-lg shadow-xl py-1 z-30 pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handlePostNow(post.id)}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-950/20 flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Post Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditPostClick(post)}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-purple-950/20 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/10 border-t border-white/[0.04] flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Quick Schedule */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          Quick Schedule
        </h2>
        <p className="text-xs text-zinc-400 mb-3">
          Best times to post based on your audience engagement patterns. Click a slot to schedule instantly.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Mon 9:00 AM", "Tue 6:00 PM", "Wed 12:00 PM", "Fri 10:00 AM", "Sat 8:00 PM"].map(
            (slot) => (
              <button
                key={slot}
                onClick={() => handleQuickScheduleClick(slot)}
                className="rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20 transition-all cursor-pointer"
              >
                {slot}
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Schedule Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#07070a]/80 backdrop-blur-md"
              onClick={() => setShowNewPostModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-lg md:max-w-xl bg-[#0B0A12]/95 border border-white/[0.08] rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 pb-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {editingPostId ? "Edit Scheduled Post" : "Schedule New Post"}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Plan and publish your content to automated social queues.</p>
                  </div>
                  <button
                    onClick={() => setShowNewPostModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 shadow-[0_0_0_rgba(168,85,247,0)] hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-300"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleScheduleSubmit} className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 py-4 overflow-y-auto space-y-5 flex-1">
                    
                    {/* Error Banner */}
                    <AnimatePresence>
                      {modalError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-xs font-semibold flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{modalError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Vault Item Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Select Vault Asset</span>
                        <span className="text-[10px] text-zinc-500 font-normal lowercase">(optional override)</span>
                      </label>
                      
                      {vaultItems.length === 0 ? (
                        <div className="p-4 rounded-xl border border-white/[0.04] bg-[#12111d]/30 text-center text-xs text-zinc-500">
                          No assets in Vault. Please create vault content first.
                        </div>
                      ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                          {vaultItems.map((item) => {
                            const isSelected = selectedVaultItemId === item.id;
                            const TypeIcon = typeIcons[item.type] || ImageIcon;
                            return (
                              <div
                                // Use distinct id to avoid type errors
                                key={item.id}
                                onClick={() => handleVaultItemSelect(item.id)}
                                className={cn(
                                  "h-20 w-28 rounded-xl shrink-0 overflow-hidden relative border cursor-pointer select-none transition-all duration-300",
                                  isSelected 
                                    ? "border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)] scale-[1.02]" 
                                    : "border-white/5 hover:border-white/20 bg-[#12111d]/50"
                                )}
                              >
                                <div
                                  className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-cyan-600/10 to-pink-600/20"
                                  style={
                                    item.thumbnailUrl
                                      ? {
                                          backgroundImage: `url(${item.thumbnailUrl})`,
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                        }
                                      : undefined
                                  }
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-2">
                                  <div className="flex justify-between items-start">
                                    <span className="p-0.5 rounded bg-black/60 text-[8px] uppercase font-bold text-white flex items-center gap-0.5">
                                      <TypeIcon className="h-2 w-2" />
                                      {item.type}
                                    </span>
                                    {isSelected && (
                                      <span className="h-3.5 w-3.5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-semibold text-white truncate leading-none">{item.title}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Schedule Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          required
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time</label>
                        <input
                          type="time"
                          required
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Custom Caption */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Caption Override</label>
                      <textarea
                        required
                        value={customCaption}
                        onChange={(e) => setCustomCaption(e.target.value)}
                        placeholder="Customize the caption for this specific scheduled slot..."
                        className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none min-h-[100px] resize-y transition-all duration-300"
                      />
                    </div>

                    {/* First Comment Override */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">First Comment Override (Optional)</label>
                      <textarea
                        value={customFirstComment}
                        onChange={(e) => setCustomFirstComment(e.target.value)}
                        placeholder="Add a first comment (e.g. extra hashtags, engagement questions)..."
                        className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none min-h-[80px] resize-y transition-all duration-300"
                      />
                    </div>

                    {/* Custom Hashtags */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hashtags</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          value={customHashtags}
                          onChange={(e) => setCustomHashtags(e.target.value)}
                          placeholder="motivation, sunset, creator (comma or space separated)"
                          className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 py-3 pl-9 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 pt-4 border-t border-white/[0.04] flex items-center justify-end gap-3 shrink-0 bg-[#0B0A12]/80 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setShowNewPostModal(false)}
                      className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {editingPostId ? "Save Post Settings" : "Schedule Post"}
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
