"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Upload,
  Search,
  Filter,
  Tag,
  Play,
  Film,
  Image as ImageIcon,
  Layers,
  FileText,
  Star,
  RefreshCw,
  X,
  CheckCircle,
  Loader2,
  Edit2,
  Trash2,
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";
import type { VaultTag, VaultItem } from "@/types";
import { supabase } from "@/lib/supabase";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const typeFilters = [
  { label: "All", value: "all", icon: Archive },
  { label: "Reels", value: "reel", icon: Play },
  { label: "Images", value: "image", icon: ImageIcon },
  { label: "Carousels", value: "carousel", icon: Layers },
  { label: "Captions", value: "caption", icon: FileText },
] as const;

const tagFilters: VaultTag[] = [
  "motivational",
  "meme",
  "educational",
  "evergreen",
  "viral",
  "bts",
  "creative",
  "lifestyle",
  "productivity",
];

const tagColors: Record<string, string> = {
  motivational: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  meme: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  educational: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  evergreen: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viral: "bg-red-500/10 text-red-400 border-red-500/20",
  trending: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  personal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  promotional: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  bts: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  creative: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  lifestyle: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  productivity: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const uploadTagsList: string[] = [
  "motivational",
  "evergreen",
  "educational",
  "viral",
  "bts",
  "creative",
  "lifestyle",
  "productivity",
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reel: Play,
  image: ImageIcon,
  carousel: Layers,
  caption: FileText,
};

export default function VaultPage() {
  const { instagramConnected, user } = useAuth();

  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load vault items from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchVaultItems = async () => {
      setIsDbLoading(true);
      try {
        const { data, error } = await supabase
          .from("vault_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching vault items from DB:", error);
          const saved = localStorage.getItem("ghostflow_vault_items");
          if (saved) {
            setVaultItems(JSON.parse(saved));
          } else {
            setVaultItems([]);
          }
        } else if (data && data.length > 0) {
          const mapped: VaultItem[] = data.map((d: any) => ({
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
          setVaultItems(mapped);
          localStorage.setItem("ghostflow_vault_items", JSON.stringify(mapped));
        } else {
          // Vault is empty — show empty state, do NOT seed fake data
          setVaultItems([]);
          localStorage.removeItem("ghostflow_vault_items");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsDbLoading(false);
      }
    };

    fetchVaultItems();
  }, [user]);

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeTags, setActiveTags] = useState<VaultTag[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states for Add to Vault modal
  const [uploadType, setUploadType] = useState<"photo" | "reel" | "carousel" | "caption">("photo");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const [isUploading, setIsUploading] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [selectedUploadTags, setSelectedUploadTags] = useState<string[]>([]);
  const [isEvergreenUpload, setIsEvergreenUpload] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Toggle selection for bulk actions
  const toggleSelectCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete specific item
  const handleDeleteClick = async (itemId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this vault item? This will also remove it from any future schedule queues.")) return;
    try {
      // Note: file is on Cloudinary — no Supabase storage cleanup needed

      const { error } = await supabase
        .from("vault_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setVaultItems((prev) => {
        const next = prev.filter((item) => item.id !== itemId);
        localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
        return next;
      });

      setSelectedIds((prev) => prev.filter((id) => id !== itemId));
      showToast("Vault item deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting vault item:", err);
      showToast(err.message || "Failed to delete vault item", "error");
    }
  };

  // Bulk operations handlers
  const handleBulkEvergreenToggle = async () => {
    if (!user || selectedIds.length === 0) return;
    
    const selectedItems = vaultItems.filter(i => selectedIds.includes(i.id));
    const allEvergreen = selectedItems.every(i => i.isEvergreen);
    const targetStatus = !allEvergreen;

    showToast(targetStatus ? "Marking assets as evergreen..." : "Removing evergreen status...", "info");

    try {
      const { error } = await supabase
        .from("vault_items")
        .update({ is_evergreen: targetStatus })
        .in("id", selectedIds);

      if (error) throw error;

      setVaultItems((prev) => {
        const next = prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, isEvergreen: targetStatus } : item
        );
        localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
        return next;
      });
      setSelectedIds([]);
      showToast(targetStatus ? "Assets marked as evergreen!" : "Evergreen status removed!", "success");
    } catch (err: any) {
      console.error("Bulk evergreen failed:", err);
      showToast(err.message || "Failed bulk evergreen toggle", "error");
    }
  };

  const handleBulkAddTag = async (tag: string) => {
    if (!user || selectedIds.length === 0) return;

    showToast(`Applying tag "${tag}" to selected items...`, "info");
    setBulkMenuOpen(false);

    try {
      await Promise.all(
        vaultItems
          .filter((item) => selectedIds.includes(item.id))
          .map((item) => {
            const currentTags = item.tags || [];
            const newTags = currentTags.includes(tag as any) ? currentTags : [...currentTags, tag as any];
            return supabase
              .from("vault_items")
              .update({ tags: newTags })
              .eq("id", item.id);
          })
      );

      setVaultItems((prev) => {
        const next = prev.map((item) => {
          if (selectedIds.includes(item.id)) {
            const currentTags = item.tags || [];
            const newTags = currentTags.includes(tag as any) ? currentTags : [...currentTags, tag as any];
            return { ...item, tags: newTags };
          }
          return item;
        });
        localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
        return next;
      });

      setSelectedIds([]);
      showToast(`Tag applied successfully!`, "success");
    } catch (err: any) {
      console.error("Bulk tagging failed:", err);
      showToast(err.message || "Failed bulk tagging operation", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected vault items? This will also remove them from any scheduled queues.`)) return;

    showToast("Bulk unlinking and deleting assets...", "info");

    try {
      // Note: files are on Cloudinary — no Supabase storage cleanup needed

      const { error } = await supabase
        .from("vault_items")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      setVaultItems((prev) => {
        const next = prev.filter((item) => !selectedIds.includes(item.id));
        localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
        return next;
      });

      setSelectedIds([]);
      showToast("Selected items deleted successfully!", "success");
    } catch (err: any) {
      console.error("Bulk delete failed:", err);
      showToast(err.message || "Failed bulk deletion", "error");
    }
  };

  const handleEditClick = (item: VaultItem) => {
    setEditingItemId(item.id);
    setUploadType(item.type === "image" ? "photo" : item.type);
    setCaptionText(item.caption);
    setSelectedUploadTags(item.tags);
    setIsEvergreenUpload(item.isEvergreen);
    setFileName(item.mediaUrl ? item.mediaUrl.split("/").pop() || "Existing Media" : null);
    setPreviewUrl(item.thumbnailUrl || null);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="Content Vault"
        description="Access and organize your content assets, configure tagging categories, and upload reels or carousels by connecting your Instagram account."
      />
    );
  }

  const toggleTag = (tag: VaultTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = vaultItems.filter((v) => {
    if (activeType !== "all" && v.type !== activeType) return false;
    if (activeTags.length > 0 && !activeTags.some((t) => v.tags.includes(t))) return false;
    if (
      search &&
      !v.title.toLowerCase().includes(search.toLowerCase()) &&
      !v.caption.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-24 relative"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Archive className="h-7 w-7 text-cyan-400" />
            Content Vault
          </h1>
          <p className="text-sm text-zinc-400">
            {vaultItems.length} items in your vault
          </p>
          
          {/* Cloudinary Storage Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5">
            <Shield className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-semibold text-zinc-400">Storage by</span>
            <span className="text-[10px] font-bold text-cyan-400">Cloudinary</span>
            <span className="text-[10px] text-zinc-600">· 25 GB free</span>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItemId(null);
            setUploadType("photo");
            setFileName(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaptionText("");
            setSelectedUploadTags([]);
            setIsEvergreenUpload(false);
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Upload Content
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vault items..."
          className="w-full rounded-lg border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50 transition-colors"
        />
      </motion.div>

      {/* Filters Toolbar & Select Toggle */}
      <motion.div variants={item} className="space-y-3">
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => setActiveType(f.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all cursor-pointer",
                  activeType === f.value
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-zinc-500" />
          {tagFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize border transition-all cursor-pointer",
                activeTags.includes(tag)
                  ? tagColors[tag]
                  : "bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300"
              )}
            >
              {tag}
            </button>
          ))}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Select All Toggle Bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-zinc-500 py-1 border-t border-white/5">
            <button
              onClick={() => {
                const allFilteredIds = filtered.map(item => item.id);
                const allSelected = allFilteredIds.every(id => selectedIds.includes(id));
                if (allSelected) {
                  setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                } else {
                  setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                }
              }}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer select-none font-medium flex items-center gap-1.5"
            >
              {filtered.every(item => selectedIds.includes(item.id)) ? "Deselect All" : "Select All Filtered"}
            </button>
            {selectedIds.length > 0 && (
              <span className="font-semibold text-violet-400 animate-pulse">
                {selectedIds.length} asset{selectedIds.length === 1 ? "" : "s"} selected
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Media Grid */}
      {filtered.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((vault) => {
            const TypeIcon = typeIcons[vault.type] || ImageIcon;
            const isSelected = selectedIds.includes(vault.id);
            return (
              <motion.div
                key={vault.id}
                variants={item}
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  "glass rounded-xl overflow-hidden group cursor-pointer transition-all border relative",
                  isSelected ? "border-violet-500 bg-violet-950/5 shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "hover:border-violet-500/20"
                )}
                onClick={(e) => toggleSelectCard(vault.id, e)}
              >
                {/* Select Checkbox Indicator */}
                <div 
                  className={cn(
                    "absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border backdrop-blur-sm transition-all duration-200 cursor-pointer select-none",
                    isSelected
                      ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20 scale-105"
                      : "bg-black/40 border-white/20 text-transparent hover:border-white/50 opacity-0 group-hover:opacity-100"
                  )}
                >
                  <Check className={cn("h-3.5 w-3.5 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                </div>

                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-cyan-600/30 to-pink-600/40"
                    style={
                      vault.thumbnailUrl
                        ? {
                            backgroundImage: `url(${vault.thumbnailUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />

                  {/* Performance Score */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-[10px] font-bold backdrop-blur-sm",
                        vault.performanceScore >= 90
                          ? "bg-emerald-500/20 text-emerald-400"
                          : vault.performanceScore >= 75
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      )}
                    >
                      {vault.performanceScore}%
                    </span>
                  </div>

                  {/* Evergreen Badge */}
                  {vault.isEvergreen && (
                    <div className="absolute bottom-2 left-2">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <RefreshCw className="h-2.5 w-2.5" />
                        Evergreen
                      </span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute bottom-2 right-2">
                    <span className="flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold uppercase text-white">
                      <TypeIcon className="h-3 w-3 text-cyan-400" />
                      {vault.type}
                    </span>
                  </div>
                </div>

                {/* Content info card */}
                <div className="p-3 bg-[#0B0A12]/40 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white truncate flex-1">{vault.title}</h3>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditClick(vault)}
                        className="p-1 text-zinc-400 hover:text-purple-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vault.id)}
                        className="p-1 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{vault.caption}</p>

                  {/* Tags */}
                  {vault.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {vault.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[8px] font-bold capitalize border tracking-tight",
                            tagColors[tag] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="mt-2.5 border-t border-white/5 pt-2 flex items-center justify-between text-[10px] font-medium text-zinc-500">
                    <span>Used {vault.usedCount}x</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {vault.performanceScore}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
            <Archive className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-white">No items found</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Try adjusting your filters or search terms
          </p>
        </motion.div>
      )}

      {/* Dynamic Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[100] flex items-center justify-between gap-4 rounded-2xl bg-zinc-950/90 border border-violet-500/25 p-4 shadow-2xl backdrop-blur-xl max-w-lg md:max-w-2xl w-[90%] text-white"
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-lg shadow-violet-500/20">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider hidden sm:inline">Selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk Toggle Evergreen */}
              <button
                onClick={handleBulkEvergreenToggle}
                className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95"
              >
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span>Evergreen</span>
              </button>

              {/* Bulk Add Tag Popover */}
              <div className="relative">
                <button
                  onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                  className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95"
                >
                  <Tag className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Apply Tag</span>
                  <ChevronRight className="h-3 w-3 rotate-90 text-zinc-500" />
                </button>

                {bulkMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBulkMenuOpen(false)} />
                    <div className="absolute bottom-full right-0 mb-2.5 z-50 bg-[#0E0D16] border border-white/10 rounded-xl shadow-2xl p-2.5 grid grid-cols-2 gap-1.5 min-w-[240px]">
                      {uploadTagsList.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleBulkAddTag(tag)}
                          className="text-left text-xs capitalize text-zinc-400 hover:text-white px-2 py-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer select-none"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-lg bg-red-950/20 border border-red-500/25 hover:bg-red-600 hover:text-white px-2.5 py-1.5 text-xs font-bold text-red-400 transition-all cursor-pointer select-none active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>

              {/* Clear Selection */}
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline font-medium px-2 py-1 select-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#07070a]/80 backdrop-blur-md"
              onClick={() => {
                setEditingItemId(null);
                setShowUploadModal(false);
              }}
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
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {editingItemId ? "Edit Vault Item" : "Add to Vault"}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Upload and organize assets for automated social media reposting.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItemId(null);
                      setShowUploadModal(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 shadow-[0_0_0_rgba(168,85,247,0)] hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-300"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 py-4 overflow-y-auto space-y-5 flex-1">
                  {/* Content Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Content Type</label>
                    <div className="grid grid-cols-4 gap-2 bg-[#12111d]/50 p-1.5 rounded-xl border border-white/[0.04]">
                      {[
                        { label: "Photo", value: "photo" as const, icon: ImageIcon },
                        { label: "Reel", value: "reel" as const, icon: Film },
                        { label: "Carousel", value: "carousel" as const, icon: Layers },
                        { label: "Caption", value: "caption" as const, icon: FileText },
                      ].map((type) => {
                        const Icon = type.icon;
                        const isActive = uploadType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setUploadType(type.value);
                              if (type.value === "caption") {
                                setFileName(null);
                              }
                            }}
                            className={cn(
                              "relative flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 outline-none select-none cursor-pointer",
                              isActive
                                ? "bg-purple-950/30 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.02] z-10 font-semibold"
                                : "bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Media Upload Area with Height Transition */}
                  <AnimatePresence initial={false}>
                    {uploadType !== "caption" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Media</label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              setFileName(e.dataTransfer.files[0].name);
                              setSelectedFile(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => {
                            const input = document.getElementById("media-file-input");
                            if (input) input.click();
                          }}
                          className={cn(
                            "relative border border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-center select-none min-h-[160px]",
                            isDragging
                              ? "border-purple-500/60 bg-purple-950/10 shadow-[0_0_25px_rgba(168,85,247,0.15)] scale-[1.01]"
                              : "border-white/[0.08] bg-[#12111a]/40 hover:border-purple-500/30 hover:bg-[#12111a]/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]"
                          )}
                        >
                          <input
                            id="media-file-input"
                            type="file"
                            className="hidden"
                            accept={uploadType === "photo" ? "image/*" : uploadType === "reel" ? "video/*" : "image/*,video/*"}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setFileName(e.target.files[0].name);
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                          />
                          
                          {fileName ? (
                            previewUrl ? (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className="flex flex-col items-center gap-4 w-full p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <div className="relative group/preview w-40 h-40 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl flex items-center justify-center">
                                  {selectedFile && selectedFile.type.startsWith("video") ? (
                                    <>
                                      <video
                                        src={previewUrl}
                                        className="w-full h-full object-cover rounded-xl"
                                        muted
                                        loop
                                        playsInline
                                        onMouseEnter={(e) => {
                                          e.currentTarget.play().catch(() => {});
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.pause();
                                          e.currentTarget.currentTime = 0;
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/preview:bg-black/10 transition-colors pointer-events-none">
                                        <div className="p-2.5 bg-purple-600/90 text-white rounded-full shadow-lg border border-purple-400/30 transform group-hover/preview:scale-110 transition-transform duration-300">
                                          <Play className="h-5 w-5 fill-white ml-0.5" />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <img
                                      src={previewUrl}
                                      alt="Preview"
                                      className="w-full h-full object-cover rounded-xl transform group-hover/preview:scale-105 transition-transform duration-500"
                                    />
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 text-left pointer-events-none">
                                    <p className="text-[10px] text-zinc-400 leading-tight">Size</p>
                                    <p className="text-xs font-semibold text-white truncate mb-1">
                                      {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : "0.00"} MB
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-center gap-1.5 w-full max-w-[280px]">
                                  <span className="text-xs font-medium text-zinc-300 truncate max-w-full text-center px-2">
                                    {fileName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFileName(null);
                                      setSelectedFile(null);
                                      setPreviewUrl(null);
                                    }}
                                    className="text-xs text-zinc-500 hover:text-red-400 font-semibold underline transition-colors cursor-pointer select-none"
                                  >
                                    Remove file
                                  </button>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
                                <p className="text-sm font-semibold text-white truncate max-w-xs">{fileName}</p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFileName(null);
                                    setSelectedFile(null);
                                  }}
                                  className="text-xs text-zinc-500 hover:text-red-400 mt-1 underline transition-colors"
                                >
                                  Remove file
                                </button>
                              </div>
                            )
                          ) : (
                            <>
                              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 mb-3 border border-purple-500/20 transition-transform">
                                <Upload className="h-5 w-5" />
                              </div>
                              <p className="text-sm font-medium text-white">
                                Drop photo or video
                              </p>
                              <p className="mt-1.5 text-xs text-zinc-500">
                                MP4, MOV, JPG, PNG • max 100MB
                              </p>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Caption Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Caption</label>
                    <textarea
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Paste your caption, content idea, or hook here…"
                      className="w-full rounded-xl border border-white/[0.06] bg-[#12111a]/60 p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 outline-none min-h-[120px] resize-y transition-all duration-300"
                    />
                  </div>

                  {/* Tag System */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {uploadTagsList.map((tag) => {
                        const isSelected = selectedUploadTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedUploadTags((prev) =>
                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-medium capitalize border transition-all duration-300 cursor-pointer select-none",
                              isSelected
                                ? "bg-purple-950/30 border-purple-500/40 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)] scale-[1.03]"
                                : "bg-[#12111a] border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.08]"
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evergreen Toggle Card */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-[#12111a]/40 hover:bg-[#12111a]/60 hover:border-white/[0.1] transition-all duration-300 flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 mr-3 shrink-0 border border-amber-500/20">
                        <Star className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">Mark as Evergreen</span>
                        <span className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          Evergreen content is prioritized for reposting by Ghost Mode.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEvergreenUpload(!isEvergreenUpload)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 border border-transparent focus:ring-1 focus:ring-purple-500/30",
                        isEvergreenUpload ? "bg-purple-600" : "bg-zinc-800"
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-200 shadow-sm",
                          isEvergreenUpload ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Footer sticky section */}
                <div className="p-6 pt-4 border-t border-white/[0.04] flex items-center justify-end gap-3 shrink-0 bg-[#0B0A12]/80 backdrop-blur-sm">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      setEditingItemId(null);
                      setUploadType("photo");
                      setFileName(null);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCaptionText("");
                      setSelectedUploadTags([]);
                      setIsEvergreenUpload(false);
                      setShowUploadModal(false);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={async () => {
                      if (!user) return;
                      
                      const vaultType = uploadType === "photo" ? ("image" as const) : uploadType;
                      const newTitle = uploadType === "caption" 
                        ? (captionText.slice(0, 30) || "Untitled Caption") 
                        : (fileName ? fileName.split(".")[0] : `New ${uploadType === "photo" ? "Image" : uploadType}`);

                      if (vaultType !== "caption" && !selectedFile && !editingItemId) {
                        showToast("Please select a file to upload", "error");
                        return;
                      }

                      setIsUploading(true);

                      try {
                        let mediaUrl: string | undefined = undefined;

                        if (editingItemId) {
                          // Keep existing URL by default if editing
                          mediaUrl = vaultItems.find(i => i.id === editingItemId)?.mediaUrl;
                        }

                        if (vaultType !== "caption" && selectedFile) {
                          // Upload to Cloudinary (25 GB free, permanent CDN URLs)
                          const formData = new FormData();
                          formData.append("file", selectedFile);
                          formData.append("upload_preset", "ghostal");
                          formData.append("folder", `ghostal/${user.id}`);

                          const cloudRes = await fetch(
                            "https://api.cloudinary.com/v1_1/da8jrztp0/auto/upload",
                            { method: "POST", body: formData }
                          );

                          if (!cloudRes.ok) {
                            const errData = await cloudRes.json().catch(() => ({}));
                            throw new Error(errData?.error?.message || "Cloudinary upload failed");
                          }

                          const cloudData = await cloudRes.json();
                          mediaUrl = cloudData.secure_url;
                        }

                        if (editingItemId) {
                          // Update existing item
                          const { data, error } = await supabase
                            .from("vault_items")
                            .update({
                              title: newTitle,
                              media_type: vaultType,
                              default_caption: captionText || "No caption provided",
                              tags: selectedUploadTags,
                              is_evergreen: isEvergreenUpload,
                              media_url: mediaUrl || "",
                              thumbnail_url: mediaUrl || "",
                            })
                            .eq("id", editingItemId)
                            .select()
                            .single();

                          if (error) {
                            throw error;
                          }

                          if (data) {
                            const updatedItem: VaultItem = {
                              id: data.id,
                              type: data.media_type as any,
                              title: data.title || newTitle,
                              caption: data.default_caption || "",
                              tags: data.tags || [],
                              mediaUrl: data.media_url || undefined,
                              thumbnailUrl: data.thumbnail_url || undefined,
                              createdAt: data.created_at,
                              usedCount: data.used_count || 0,
                              performanceScore: data.performance_score || 85,
                              isEvergreen: data.is_evergreen || false,
                            };
                            setVaultItems((prev) => {
                              const next = prev.map((item) => (item.id === editingItemId ? updatedItem : item));
                              localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
                              return next;
                            });
                          }
                        } else {
                          // Insert new item
                          const { data, error } = await supabase
                            .from("vault_items")
                            .insert({
                              user_id: user.id,
                              title: newTitle,
                              media_type: vaultType,
                              default_caption: captionText || "No caption provided",
                              tags: selectedUploadTags,
                              is_evergreen: isEvergreenUpload,
                              used_count: 0,
                              performance_score: 85,
                              media_url: mediaUrl || "",
                              thumbnail_url: mediaUrl || "",
                            })
                            .select()
                            .single();

                          if (error) {
                            throw error;
                          }

                          if (data) {
                            const newItem: VaultItem = {
                              id: data.id,
                              type: data.media_type as any,
                              title: data.title || newTitle,
                              caption: data.default_caption || "",
                              tags: data.tags || [],
                              mediaUrl: data.media_url || undefined,
                              thumbnailUrl: data.thumbnail_url || undefined,
                              createdAt: data.created_at,
                              usedCount: data.used_count || 0,
                              performanceScore: data.performance_score || 85,
                              isEvergreen: data.is_evergreen || false,
                            };
                            setVaultItems((prev) => {
                              const next = [newItem, ...prev];
                              localStorage.setItem("ghostflow_vault_items", JSON.stringify(next));
                              return next;
                            });
                          }
                        }

                        // Success cleanup and close
                        const isEdit = !!editingItemId;
                        setEditingItemId(null);
                        setUploadType("photo");
                        setFileName(null);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setCaptionText("");
                        setSelectedUploadTags([]);
                        setIsEvergreenUpload(false);
                        setShowUploadModal(false);
                        
                        showToast(
                          isEdit ? "Asset updated successfully!" : "Asset uploaded successfully!",
                          "success"
                        );


                      } catch (err: any) {
                        console.error("Error in upload/update process:", err);
                        showToast(err.message || "An unexpected error occurred.", "error");
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading…
                      </span>
                    ) : (
                      editingItemId ? "Save Changes" : "Save to Vault"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Floating Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2 border min-w-[280px]",
              toast.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md",
              toast.type === "error" && "bg-red-500/10 border-red-500/20 text-red-400 backdrop-blur-md",
              toast.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-400 backdrop-blur-md"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0 animate-pulse" />
            ) : toast.type === "error" ? (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            ) : (
              <Bell className="h-5 w-5 shrink-0" />
            )}
            <span className="flex-1 truncate">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
