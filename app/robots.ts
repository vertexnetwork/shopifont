import type { MetadataRoute } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * `robots.txt` source. Sitemap URL from siteConfig. AI bot allowlist
 * loaded from `public/ai-bots.json` (HUB-synced) so adding a new
 * crawler hub-side propagates network-wide on the next sync (spec §8).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteConfig.url;
  const aiBots = await loadAiBotsAllowlist();

  const rules: MetadataRoute.Robots["rules"] = [
    { userAgent: "*", allow: "/" },
    ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
  ];

  return {
    rules,
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

async function loadAiBotsAllowlist(): Promise<ReadonlyArray<string>> {
  try {
    const file = path.resolve(process.cwd(), "public", "ai-bots.json");
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as { allow?: ReadonlyArray<string> };
    return parsed.allow ?? [];
  } catch {
    return [];
  }
}
