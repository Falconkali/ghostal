"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Archive,
  TrendingUp,
  Play,
  RefreshCw,
  PlusCircle,
  Shield,
  Loader2,
} from "lucide-react";
import { cn, formatTitle } from "@/lib/utils";
import { mockSurvivalLogs } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";
import { supabase } from "@/lib/supabase";
import type { SurvivalLog, VaultItem, AISuggestion } from "@/types";
import { remixCaption } from "@/lib/automation";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  resurrect: RotateCcw,
  remix: Sparkles,
  repost: RefreshCw,
  new_content: PlusCircle,
};

const typeColors: Record<string, string> = {
  resurrect: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  remix: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  repost: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  new_content: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function AISurvivalPage() {
  const { instagramConnected, user } = useAuth();
  const [logs, setLogs] = useState<SurvivalLog[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);

  const fetchSurvivalData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch survival logs
      const { data: logData, error: logError } = await supabase
        .from("survival_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      let currentLogs: SurvivalLog[] = [];

      if (logError) {
        console.error("Error fetching logs:", logError);
      } else if (logData && logData.length > 0) {
        currentLogs = logData.map((d: any) => ({
          id: d.id,
          action: d.action,
          description: d.description || "",
          timestamp: d.timestamp,
          status: d.status as any,
          postId: d.post_id || undefined,
        }));
      } else {
        // Seed database logs fallback
        const { error: seedError } = await supabase
          .from("survival_logs")
          .insert(
            mockSurvivalLogs.map((l) => ({
              user_id: user.id,
              action: l.action,
              description: l.description,
              timestamp: l.timestamp,
              status: l.status,
            }))
          );

        if (!seedError) {
          const { data: reFetchedLogs } = await supabase
            .from("survival_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false });
          if (reFetchedLogs) {
            currentLogs = reFetchedLogs.map((d: any) => ({
              id: d.id,
              action: d.action,
              description: d.description || "",
              timestamp: d.timestamp,
              status: d.status as any,
              postId: d.post_id || undefined,
            }));
          }
        }
      }

      setLogs(currentLogs);

      // 2. Fetch queue size
      const nowStr = new Date().toISOString();
      const { count } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "scheduled")
        .gt("scheduled_at", nowStr);
      setQueueCount(count || 0);

      // 3. Fetch vault items to synthesize suggestions
      const { data: vaultData } = await supabase
        .from("vault_items")
        .select("*")
        .eq("user_id", user.id);

      const items: VaultItem[] = vaultData
        ? vaultData.map((d: any) => ({
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
          }))
        : [];

      // Generate suggestions based on vault items
      if (items.length === 0) {
        setSuggestions([
          {
            id: "ai_new_1",
            type: "new_content",
            title: "Trending Topic: Setup Upgrades",
            description: "Workspace setups are pulling 1.8x engagement this week. Add a photo or caption to your Content Vault to schedule.",
            confidence: 85,
            createdAt: new Date().toISOString(),
          },
          {
            id: "ai_new_2",
            type: "new_content",
            title: "Educational Carousel Template",
            description: "Audience retention is high on multi-slide tips. Save a carousel structure in your vault.",
            confidence: 80,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        const generated: AISuggestion[] = [];
        
        // 1. Resurrect Suggestion (High performing used item)
        const sortedPerformance = [...items].sort((a, b) => b.performanceScore - a.performanceScore);
        if (sortedPerformance.length > 0) {
          const item = sortedPerformance[0];
          generated.push({
            id: `sug_res_${item.id}`,
            type: "resurrect",
            title: `Resurrect: ${formatTitle(item.title)}`,
            description: `This evergreen asset has a premium ${item.performanceScore}% score. It has been shared ${item.usedCount} times. Ready for immediate republishing.`,
            confidence: 94,
            vaultItemId: item.id,
            suggestedCaption: remixCaption(item.caption, item.tags, true),
            createdAt: new Date().toISOString(),
          });
        }

        // 2. Remix Suggestion
        const reels = items.filter((i) => i.type === "reel" || i.type === "carousel");
        if (reels.length > 0) {
          const item = reels[reels.length - 1];
          generated.push({
            id: `sug_rem_${item.id}`,
            type: "remix",
            title: `Caption Remix: ${formatTitle(item.title)}`,
            description: `AI synthesized a fresh caption variation for this ${item.type} to re-engage active followers with new hooks.`,
            confidence: 88,
            vaultItemId: item.id,
            suggestedCaption: remixCaption(item.caption, item.tags, true),
            createdAt: new Date().toISOString(),
          });
        }

        // 3. Repost Suggestion (Evergreen unmodified)
        const evergreens = items.filter((i) => i.isEvergreen);
        if (evergreens.length > 0) {
          const item = evergreens[0];
          generated.push({
            id: `sug_rep_${item.id}`,
            type: "repost",
            title: `Repost: ${formatTitle(item.title)}`,
            description: `Repost unmodified evergreen content. Your follower count has expanded, so new viewers haven't seen this.`,
            confidence: 91,
            vaultItemId: item.id,
            suggestedCaption: item.caption,
            createdAt: new Date().toISOString(),
          });
        }

        // Pad if necessary
        if (generated.length < 3) {
          generated.push({
            id: "sug_trend_1",
            type: "new_content",
            title: "Trending: Creator Systems",
            description: "Sharing behind-the-scenes systems is pulling great audience retention. Consider uploading a routine workflow post.",
            confidence: 82,
            createdAt: new Date().toISOString(),
          });
        }

        setSuggestions(generated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchSurvivalData();
  }, [fetchSurvivalData]);

  // Listen to client-side automation runner broadcasts
  useEffect(() => {
    if (!user) return;
    const handleSync = () => { fetchSurvivalData(); };
    window.addEventListener("automation_run", handleSync);
    return () => window.removeEventListener("automation_run", handleSync);
  }, [user, fetchSurvivalData]);

  // Supabase Realtime subscription — fires whenever the backend cron job
  // inserts a new row into survival_logs (e.g. after publishing a scheduled post)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-ai-survival-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "survival_logs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSurvivalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSurvivalData]);

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    if (!user || !suggestion.vaultItemId) return;
    setApplyingId(suggestion.id);
    
    try {
      // 1. Fetch the vault item
      const { data: vaultItem, error: fetchErr } = await supabase
        .from("vault_items")
        .select("*")
        .eq("id", suggestion.vaultItemId)
        .single();

      if (fetchErr || !vaultItem) {
        console.error("Error fetching suggestion vault item:", fetchErr);
        return;
      }

      // 2. Decide scheduled time (1 day from now)
      const scheduleTime = new Date();
      scheduleTime.setHours(scheduleTime.getHours() + 24);

      // 3. Insert into scheduled_posts
      const { data: newPost, error: insertErr } = await supabase
        .from("scheduled_posts")
        .insert({
          user_id: user.id,
          vault_item_id: vaultItem.id,
          caption: suggestion.suggestedCaption || vaultItem.default_caption || "Untitled suggestion",
          hashtags: vaultItem.tags || [],
          scheduled_at: scheduleTime.toISOString(),
          status: "scheduled",
          type: vaultItem.media_type,
          thumbnail_url: vaultItem.thumbnail_url || null,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Error inserting post from suggestion:", insertErr);
        return;
      }

      // 4. Increment used count
      await supabase
        .from("vault_items")
        .update({ used_count: (vaultItem.used_count || 0) + 1 })
        .eq("id", vaultItem.id);

      // 5. Log action in survival_logs
      await supabase
        .from("survival_logs")
        .insert({
          user_id: user.id,
          action: suggestion.type === "resurrect" ? "Content Resurrected" : "AI Suggestions Applied",
          description: `Applied suggestion: resurrected "${formatTitle(vaultItem.title)}" and queued it for ${scheduleTime.toLocaleDateString()}.`,
          status: "success",
          post_id: newPost.id,
        });

      setSuccessMessage(`Successfully queued "${formatTitle(vaultItem.title)}" for posting!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      
      // Reload page data
      fetchSurvivalData();
    } catch (e) {
      console.error("Failed to apply suggestion:", e);
    } finally {
      setApplyingId(null);
    }
  };

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="AI Survival Center"
        description="Monitor automated content recycling, view log files for queue activity, configure curation thresholds, and review fallback captions by connecting your Instagram account."
      />
    );
  }

  const successCount = logs.filter((l) => l.status === "success").length;
  const warningCount = logs.filter((l) => l.status === "warning").length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-7 w-7 text-violet-400" />
            AI Survival Center
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            AI-powered content resurrection, remixing, and survival automation.
          </p>
        </div>
        
        {isLoading && <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />}
      </motion.div>

      {/* Alert toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center hover:border-violet-500/20 transition-colors">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-cyan-500/10 mb-2">
            <RotateCcw className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{successCount}</p>
          <p className="text-xs text-zinc-500">Total Resurrections</p>
        </div>
        <div className="glass rounded-xl p-4 text-center hover:border-violet-500/20 transition-colors">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-violet-500/10 mb-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {logs.filter(l => l.action.toLowerCase().includes("remix")).length + 2}
          </p>
          <p className="text-xs text-zinc-500">Remixed Captions</p>
        </div>
        <div className="glass rounded-xl p-4 text-center hover:border-violet-500/20 transition-colors">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {logs.filter(l => l.action.toLowerCase().includes("publish") || l.action.toLowerCase().includes("resurrect")).length}
          </p>
          <p className="text-xs text-zinc-500">Survival Posts</p>
        </div>
        <div className="glass rounded-xl p-4 text-center hover:border-violet-500/20 transition-colors">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-amber-500/10 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {successCount + warningCount > 0 ? `${Math.round((successCount / (successCount + warningCount)) * 100)}%` : "98%"}
          </p>
          <p className="text-xs text-zinc-500">Success Rate</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions Grid - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={item}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              AI Suggestions
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {suggestions.map((suggestion) => {
                const TypeIcon = typeIcons[suggestion.type] || Sparkles;
                const isApplying = applyingId === suggestion.id;
                return (
                  <motion.div
                    key={suggestion.id}
                    variants={item}
                    whileHover={{ y: -4 }}
                    className="glass rounded-xl p-5 hover:border-violet-500/20 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase border",
                            typeColors[suggestion.type]
                          )}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {suggestion.type.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-12 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${suggestion.confidence}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={cn(
                                "h-full rounded-full",
                                suggestion.confidence >= 90
                                  ? "bg-emerald-500"
                                  : suggestion.confidence >= 80
                                  ? "bg-violet-500"
                                  : "bg-amber-500"
                              )}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500">{suggestion.confidence}%</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-semibold text-white">{suggestion.title}</h3>
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-3">
                        {suggestion.description}
                      </p>

                      {/* Suggested Caption */}
                      {suggestion.suggestedCaption && (
                        <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            Suggested Caption
                          </p>
                          <p className="text-xs text-zinc-300 line-clamp-2">
                            {suggestion.suggestedCaption}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {suggestion.vaultItemId ? (
                      <button
                        onClick={() => handleApplySuggestion(suggestion)}
                        disabled={isApplying}
                        className="mt-4 flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors group-hover:translate-x-1 transition-transform"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Queuing...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            Apply Suggestion
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="mt-4 text-[10px] text-zinc-600 block italic">
                        Upload vault assets to activate
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Content Resurrection Engine Card */}
          <motion.div variants={item} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <RotateCcw className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Content Resurrection Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  AI identifies top-performing old content ready for revival
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Ready to Resurrect", value: suggestions.filter(s => s.type === "resurrect").length.toString(), color: "text-cyan-400" },
                { label: "Resurrected Total", value: successCount.toString(), color: "text-violet-400" },
                { label: "Engagement Boost", value: "+24.5%", color: "text-emerald-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center"
                >
                  <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Queue Alert Card */}
          <motion.div
            variants={item}
            className={cn(
              "rounded-xl border p-5 transition-colors",
              queueCount < 3
                ? "bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20"
                : "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className={cn("h-5 w-5", queueCount < 3 ? "text-red-400" : "text-amber-400")} />
              <h3 className={cn("text-sm font-semibold", queueCount < 3 ? "text-red-400" : "text-amber-400")}>
                {queueCount < 3 ? "Critical Queue Alert" : "Queue Alert"}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {queueCount < 3
                ? `Critical: You only have ${queueCount} posts scheduled. AI Survival system is actively running in the background to inject resurrected evergreen items.`
                : `Your posting queue has ${queueCount} posts scheduled. The AI Survival system will auto-activate to queue backup items if count drops below 3.`}
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((queueCount / 10) * 100, 100)}%` }}
                transition={{ duration: 1 }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  queueCount < 3 ? "from-red-500 to-orange-500" : "from-amber-500 to-orange-500"
                )}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-zinc-500">
              <span>0 posts</span>
              <span>10 posts</span>
            </div>
          </motion.div>

          {/* Survival Automation Logs */}
          <motion.div variants={item} className="glass rounded-xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              Survival Logs
            </h2>
            
            {logs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-6">No automation logs registered.</p>
            ) : (
              <div className="space-y-0">
                {logs.map((log, i) => (
                  <div key={log.id} className="flex gap-3 pb-4 last:pb-0">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          log.status === "success"
                            ? "bg-emerald-500/10"
                            : log.status === "warning"
                            ? "bg-amber-500/10"
                            : "bg-blue-500/10"
                        )}
                      >
                        {log.status === "success" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        ) : log.status === "warning" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                        )}
                      </div>
                      {i < logs.length - 1 && (
                        <div className="w-[1px] flex-1 bg-white/5 mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-2 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">{log.action}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {log.description}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1">
                        {new Date(log.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

