import type { MetadataRoute } from "next";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";
import { PSEO_ENTRIES } from "@/content/pseo";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * Stable `lastmod` source. Spec §6 prefers the Vercel deploy commit
 * date over `new Date()` so deploys with no content changes don't churn
 * every URL's lastmod and trigger pointless re-crawls.
 *
 * Falls back to build time when the env var isn't present (local /
 * non-Vercel builds).
 */
const LAST_MOD: Date = (() => {
  const raw = process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE?.trim();
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
})();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const home = {
    url: `${base}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 1.0,
  };

  const required = (
    [
      ["/about", "monthly", 0.5],
      ["/contact", "yearly", 0.4],
      ["/privacy", "yearly", 0.3],
      ["/terms", "yearly", 0.3],
      ["/changelog", "weekly", 0.4],
      ["/network", "monthly", 0.4],
    ] as ReadonlyArray<[
      string,
      "yearly" | "monthly" | "weekly",
      number,
    ]>
  ).map(([path, freq, priority]) => ({
    url: `${base}${path}`,
    lastModified: LAST_MOD,
    changeFrequency: freq,
    priority,
  }));

  const embedThis = {
    url: `${base}/embed-this`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  };

  const extension = {
    url: `${base}/extension`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  };

  const recommendations = {
    url: `${base}/recommendations`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  };

  const pseo = PSEO_ENTRIES.map((entry) => ({
    url: `${base}/${entry.slug}`,
    lastModified: LAST_MOD,
    // Tiered off a real signal (page intent + theme popularity) instead of
    // one uniform value across the whole set — see content/pseo.ts.
    changeFrequency: entry.sitemapChangeFrequency,
    priority: entry.sitemapPriority,
  }));

  const evergreen = EVERGREEN_ENTRIES.map((entry) => ({
    url: `${base}/${entry.slug}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: entry.priority,
  }));

  return [
    home,
    ...required,
    embedThis,
    extension,
    recommendations,
    ...evergreen,
    ...pseo,
  ];
}
