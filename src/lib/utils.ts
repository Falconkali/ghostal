import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTitle(title: string): string {
  if (!title) return "Untitled Asset";
  // Check if it's a UUID or MD5/hex hash (32 or 36 chars)
  const isHexOrUuid = /^[0-9a-f]{32}$/i.test(title) || 
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(title);
  if (isHexOrUuid) {
    return `Asset_${title.substring(0, 8)}`;
  }
  if (title.length > 25) {
    return title.substring(0, 22) + "...";
  }
  return title;
}
