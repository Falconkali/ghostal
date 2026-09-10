"use client";

import { useAuth } from "@/hooks/use-auth";
import { PLAN_LIMITS, type PlanKey } from "@/lib/constants";

/**
 * usePlan() — returns the current user's plan key and their feature limits.
 *
 * Usage:
 *   const { plan, limits } = usePlan();
 *   if (limits.ghostMode) { ... }
 *   if (vaultItems.length >= limits.vaultItems) { // show upgrade prompt }
 */
export function usePlan() {
  const { user } = useAuth();
  const plan = ((user?.plan ?? "starter") as PlanKey);
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
  return { plan, limits };
}
