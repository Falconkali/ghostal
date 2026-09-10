const fs = require('fs');

const file = 'c:/Users/dell/OneDrive/Desktop/happy/src/app/(dashboard)/analytics/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

const weekTarget = `        const currentFollowers = realFollowers || 0;
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
            : baselineReach;`;

const weekReplacement = `        const currentFollowers = realFollowers || 0;
        const isFuture = targetDay.getTime() > Date.now();
        let engagementRate = 0;
        let estimatedReach = 0;

        if (isFuture) {
          engagementRate = postCount > 0
            ? parseFloat((1.5 + (avgPerfScore / 100) * 5.0).toFixed(1))
            : 0;
          const baselineReach = Math.round(currentFollowers * 0.015);
          estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsOnDay.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.12) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : 0;
        } else {
          if (igPostsOnDay.length > 0) {
            const totalEngagements = igPostsOnDay.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
            engagementRate = currentFollowers > 0 
               ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
               : parseFloat(totalEngagements.toFixed(1));
            estimatedReach = totalEngagements > 0 ? totalEngagements * 10 : Math.round(currentFollowers * 0.015);
          } else {
             engagementRate = 0;
             estimatedReach = 0;
          }
        }`;

const monthTarget = `        const engagementRate = postCount > 0
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
            : baselineReach;`;

const monthReplacement = `        const currentFollowers = realFollowers || 0;
        const startDaysAgoForEng = (4 - idx) * 7;
        const isFuture = startDaysAgoForEng < 0; // If startDaysAgo is negative, it's future

        let engagementRate = 0;
        let estimatedReach = 0;

        if (isFuture) {
          engagementRate = postCount > 0
            ? parseFloat((1.8 + (avgPerfScore / 100) * 4.8).toFixed(1))
            : 0;
          const baselineReach = Math.round(currentFollowers * 0.05);
          estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsInWeek.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.32) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : 0;
        } else {
          if (igPostsInWeek.length > 0) {
            const totalEngagements = igPostsInWeek.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
            engagementRate = currentFollowers > 0 
               ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
               : parseFloat(totalEngagements.toFixed(1));
            estimatedReach = totalEngagements > 0 ? totalEngagements * 10 : Math.round(currentFollowers * 0.05);
          } else {
             engagementRate = 0;
             estimatedReach = 0;
          }
        }`;

content = content.replace(weekTarget, weekReplacement);
content = content.replace(monthTarget, monthReplacement);

fs.writeFileSync(file, content, 'utf-8');
