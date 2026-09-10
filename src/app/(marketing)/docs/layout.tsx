import { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Documentation — ${APP_NAME}`,
  description: "Get started with Ghostal. Learn how to configure your account, set up Ghost Mode, and manage your vault.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
