const fs = require('fs');

const filePath = 'c:/Users/dell/OneDrive/Desktop/happy/src/app/(dashboard)/analytics/page.tsx';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const newContent = `  // Live Metrics States
  const [consistencyScore, setConsistencyScore] = useState(85);
  const [momentumStability, setMomentumStability] = useState(88);
  const [queueLifespanDays, setQueueLifespanDays] = useState(0);
  const [survivalActivations, setSurvivalActivations] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [tagPerformance, setTagPerformance] = useState<{ tag: string; count: number; avgScore: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Real Instagram account stats
  const [igStats, setIgStats] = useState<{ followers: number; mediaCount: number; handle: string } | null>(null);
  const [igMediaLoaded, setIgMediaLoaded] = useState(false);

  // Raw data for memoization
  const [rawData, setRawData] = useState<{ posts: any[], logs: any[], vault: any[], igMedia: any[], realFollowers: number }>({ posts: [], logs: [], vault: [], igMedia: [], realFollowers: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch raw data ONCE (or on manual sync)
  const fetchAnalyticsData = async (manualSync = false) => {
    if (!user) return;
    if (manualSync) setIsSyncing(true);
    else setIsLoading(true);
    
    try {
      const boundsDate = new Date();
      boundsDate.setDate(boundsDate.getDate() - 30); // Always fetch 30 days for client-side filtering

      const [
        { data: postsData },
        { data: logsData },
        { data: vaultData },
        { data: profileRow }
      ] = await Promise.all([
        supabase.from("scheduled_posts").select("*").eq("user_id", user.id).gte("scheduled_at", boundsDate.toISOString()),
        supabase.from("survival_logs").select("*").eq("user_id", user.id).gte("created_at", boundsDate.toISOString()),
        supabase.from("vault_items").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("instagram_handle").eq("id", user.id).single()
      ]);

      const posts = postsData || [];
      const logs = logsData || [];
      const vault = vaultData || [];
      
      let igMediaItems: any[] = [];
      let realFollowers = 0;
      let realMediaCount = 0;
      let realHandle = profileRow?.instagram_handle || "";

      // Client-side caching for Instagram API calls
      const cacheKeyStats = \`ig_stats_\${user.id}\`;
      const cacheKeyMedia = \`ig_media_\${user.id}\`;
      const now = Date.now();
      
      let cachedStats = null;
      let cachedMedia = null;
      
      if (!manualSync && typeof window !== "undefined") {
        try {
          const s = sessionStorage.getItem(cacheKeyStats);
          const m = sessionStorage.getItem(cacheKeyMedia);
          if (s) { const p = JSON.parse(s); if (now - p.timestamp < 300000) cachedStats = p.data; }
          if (m) { const p = JSON.parse(m); if (now - p.timestamp < 300000) cachedMedia = p.data; }
        } catch(e) {}
      }

      try {
        if (cachedStats) {
          realFollowers = cachedStats.followers ?? 0;
          realMediaCount = cachedStats.postsCount ?? 0;
          realHandle = cachedStats.username || realHandle;
        } else {
          const statsRes = await fetch(\`/api/instagram/stats?userId=\${user.id}\`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            realFollowers = statsData.followers ?? 0;
            realMediaCount = statsData.postsCount ?? 0;
            realHandle = statsData.username || realHandle;
            if (typeof window !== "undefined") sessionStorage.setItem(cacheKeyStats, JSON.stringify({ timestamp: now, data: statsData }));
          }
        }
        setIgStats({ followers: realFollowers, mediaCount: realMediaCount, handle: realHandle });

        if (cachedMedia) {
          igMediaItems = cachedMedia.items || [];
          if (igMediaItems.length > 0) setIgMediaLoaded(true);
        } else {
          const mediaRes = await fetch(\`/api/instagram/media?userId=\${user.id}\`);
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            if (mediaData.items && mediaData.items.length > 0) {
              igMediaItems = mediaData.items;
              setIgMediaLoaded(true);
              if (typeof window !== "undefined") sessionStorage.setItem(cacheKeyMedia, JSON.stringify({ timestamp: now, data: mediaData }));
            }
          }
        }
      } catch (igErr) {
        console.warn("Instagram API error in analytics:", igErr);
      }

      setRawData({ posts, logs, vault, igMedia: igMediaItems, realFollowers });

    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const handleAutoRun = () => fetchAnalyticsData(true);
    window.addEventListener("automation_run", handleAutoRun);
    return () => window.removeEventListener("automation_run", handleAutoRun);
  }, [user]);

  // 2. Memoized calculations based on timePeriod and rawData
  useEffect(() => {
    if (isLoading || (rawData.posts.length === 0 && rawData.vault.length === 0)) return;
    
    const { posts, logs, vault, igMedia: igMediaItems, realFollowers } = rawData;
    
    // Calculate global metrics
    const activationsCount = logs.filter(
      (l) => l.action?.toLowerCase().includes("resurrect") || l.action?.toLowerCase().includes("activate")
    ).length;
    setSurvivalActivations(activationsCount);

    const futureScheduled = posts.filter(
      (p) => p.status === "scheduled" && new Date(p.scheduled_at).getTime() > Date.now()
    );

    let lifespan = 0;
    if (futureScheduled.length > 0) {
      const sorted = [...futureScheduled].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      );
      lifespan = Math.max(0, Math.ceil((new Date(sorted[0].scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }
    setQueueLifespanDays(lifespan);

    const recentPostsCount = posts.filter(
      (p) => new Date(p.scheduled_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const calculatedConsistency = Math.min(100, Math.max(0, Math.round(50 + recentPostsCount * 8 + (lifespan > 3 ? 15 : 0))));
    setConsistencyScore(calculatedConsistency || 85);

    const queueHealth = Math.min(100, Math.round((lifespan / 15) * 100));
    setMomentumStability(Math.round((calculatedConsistency + Math.max(70, queueHealth)) / 2) || 88);

    const sortedVault = [...vault].sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
    setTopContent(sortedVault.slice(0, 5));

    const tagMap: { [key: string]: { count: number; totalScore: number } } = {};
    vault.forEach((item) => {
      (item.tags || []).forEach((tag: string) => {
        if (!tagMap[tag]) tagMap[tag] = { count: 0, totalScore: 0 };
        tagMap[tag].count += 1;
        tagMap[tag].totalScore += (item.performance_score || 0);
      });
    });
    setTagPerformance(
      Object.entries(tagMap)
        .map(([tag, data]) => ({ tag, count: data.count, avgScore: Math.round(data.totalScore / data.count) }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5)
    );

    // Filter posts for chart bounds
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeksOfMonth = ["W1", "W2", "W3", "W4"];

    if (timePeriod === "week") {
      const synthesized: ChartDataPoint[] = daysOfWeek.map((day, idx) => {
        const dayOffset = idx - new Date().getDay() + 1;
        const targetDay = new Date();
        targetDay.setDate(targetDay.getDate() + dayOffset);

        const postsOnDay = posts.filter((p) => {
          const d = new Date(p.scheduled_at);
          return (
            d.getFullYear() === targetDay.getFullYear() &&
            d.getMonth() === targetDay.getMonth() &&
            d.getDate() === targetDay.getDate()
          );
        });

        const postCount = postsOnDay.length;
        let avgPerfScore = 75;
        if (postCount > 0) {
          const scores = postsOnDay.map((p) => {
            const vaultItem = vault.find((v) => v.id === p.vault_item_id);
            return vaultItem?.performance_score ?? 75;
          });
          avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        }

        const igPostsOnDay = igMediaItems.filter((m) => {
          const d = new Date(m.timestamp);
          return (
            d.getFullYear() === targetDay.getFullYear() &&
            d.getMonth() === targetDay.getMonth() &&
            d.getDate() === targetDay.getDate()
          );
        });

        const currentFollowers = realFollowers || 0;
        const engagementRate = postCount > 0
          ? parseFloat((1.5 + (avgPerfScore / 100) * 5.0).toFixed(1))
          : parseFloat((0.8 + (idx % 3) * 0.1).toFixed(1));

        const baselineReach = Math.round(currentFollowers * 0.015);
        const estimatedReach = postCount > 0
          ? baselineReach + Math.round(postsOnDay.map((p) => {
              const vaultItem = vault.find((v) => v.id === p.vault_item_id);
              const score = vaultItem?.performance_score ?? 75;
              return (currentFollowers * 0.12) * (score / 100);
            }).reduce((sum, r) => sum + r, 0))
          : igPostsOnDay.length > 0
            ? baselineReach * 2
            : baselineReach;

        return {
          date: day,
          posts: postCount,
          reach: estimatedReach,
          engagement: engagementRate,
          followers: currentFollowers > 0 ? currentFollowers : 0,
          newFollowers: Math.round(currentFollowers * 0.002) + postCount * 3,
          momentum: Math.min(100, 70 + postCount * 10),
        };
      });
      setChartData(synthesized);
    } else {
      const synthesized: ChartDataPoint[] = weeksOfMonth.map((week, idx) => {
        const startDaysAgo = (4 - idx) * 7;
        const endDaysAgo = (3 - idx) * 7;

        const postsInWeek = posts.filter((p) => {
          const timeDiff = Date.now() - new Date(p.scheduled_at).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const postCount = postsInWeek.length;
        let avgPerfScore = 75;
        if (postCount > 0) {
          const scores = postsInWeek.map((p) => {
            const vaultItem = vault.find((v) => v.id === p.vault_item_id);
            return vaultItem?.performance_score ?? 75;
          });
          avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        }

        const igPostsInWeek = igMediaItems.filter((m) => {
          const timeDiff = Date.now() - new Date(m.timestamp).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const engagementRate = postCount > 0
          ? parseFloat((1.8 + (avgPerfScore / 100) * 4.8).toFixed(1))
          : parseFloat((1.1 + (idx % 2) * 0.1).toFixed(1));

        const currentFollowers = realFollowers || 0;
        const baselineReach = Math.round(currentFollowers * 0.05);
        const estimatedReach = postCount > 0
          ? baselineReach + Math.round(postsInWeek.map((p) => {
              const vaultItem = vault.find((v) => v.id === p.vault_item_id);
              const score = vaultItem?.performance_score ?? 75;
              return (currentFollowers * 0.32) * (score / 100);
            }).reduce((sum, r) => sum + r, 0))
          : igPostsInWeek.length > 0
            ? baselineReach * 2
            : baselineReach;

        return {
          date: week,
          posts: postCount,
          reach: estimatedReach,
          engagement: engagementRate,
          followers: currentFollowers > 0 ? currentFollowers : 0,
          newFollowers: Math.round(currentFollowers * 0.01) + postCount * 8,
          momentum: Math.min(100, 75 + postCount * 4),
        };
      });
      setChartData(synthesized);
    }
  }, [timePeriod, rawData, isLoading]);
`;

const linesToKeepBefore = lines.slice(0, 84);
const linesToKeepAfter = lines.slice(399);

const finalContent = linesToKeepBefore.join('\\n') + '\\n' + newContent + '\\n' + linesToKeepAfter.join('\\n');
fs.writeFileSync(filePath, finalContent, 'utf-8');
