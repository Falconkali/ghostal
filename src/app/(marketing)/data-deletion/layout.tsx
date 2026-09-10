import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Data Deletion Instructions — ${APP_NAME}`,
  description: "Learn how to request deletion of your account and personal data from Ghostal.",
};

export default function DataDeletionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
