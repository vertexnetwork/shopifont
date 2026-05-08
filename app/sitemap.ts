import type { MetadataRoute } from "next";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";
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

  const extension = {
    url: `${base}/extension`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  };

  // Vertex Network hub. Linked from every page's footer; adding it
  // here makes sure Google indexes it as a first-class destination
  // rather than just a footer-discovered page.
  const network = {
    url: `${base}/network`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  };

  const pages = PSEO_ENTRIES.map((entry) => ({
    url: `${base}/${entry.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Hand-crafted evergreen guides (uninstall guide, decision framework,
  // best-fonts listicle). Single source of truth lives in
  // content/evergreen.ts; sitemap and llms.txt iterate the same array
  // so adding a new entry propagates everywhere.
  const evergreen = EVERGREEN_ENTRIES.map((entry) => ({
    url: `${base}/${entry.slug}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: entry.priority,
  }));

  return [
    home,
    about,
    changelog,
    embedThis,
    extension,
    network,
    ...evergreen,
    ...pages,
  ];
}
