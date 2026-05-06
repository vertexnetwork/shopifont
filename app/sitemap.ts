import type { MetadataRoute } from "next";
import { PSEO_ENTRIES } from "@/content/pseo";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const today = new Date();

  const home = {
    url: `${base}/`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 1.0,
  };

  const about = {
    url: `${base}/about`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  };

  const changelog = {
    url: `${base}/changelog`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  };

  // /embed-this is the marketing surface partners discover; /embed
  // itself is intentionally excluded from the sitemap (it's a partner
  // endpoint, noindexed at the route level).
  const embedThis = {
    url: `${base}/embed-this`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  };

  const pages = PSEO_ENTRIES.map((entry) => ({
    url: `${base}/${entry.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [home, about, changelog, embedThis, ...pages];
}
