import { APP_NAME } from "@/lib/constants";
import BlogClient from "./blog-client";

export const metadata = {
  title: `Blog — ${APP_NAME}`,
  description: "Guides, insights, and strategies to stay consistent, avoid burnout, and optimize calendar consistency.",
};

export default function BlogPage() {
  return <BlogClient />;
}
