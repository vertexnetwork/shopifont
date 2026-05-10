/**
 * Loader + types for the canonical Vertex Network registry. The data
 * file `public/network.json` is HUB-synced via
 * `.github/workflows/sync-from-hub.yml`. This module is the only place
 * that should touch the JSON directly — everything else reads typed
 * objects from `getNetworkProperties()`.
 */

import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "./site-config";

/** Canonical Property shape locked across the network (spec §7). */
export type Property = {
  slug: string;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  audience: string;
  tags: ReadonlyArray<string>;
  status: "live" | "soon";
};

export type NetworkRegistry = {
  version: string;
  brand: string;
  sites: ReadonlyArray<Property>;
};

let cached: NetworkRegistry | null = null;

async function loadRegistry(): Promise<NetworkRegistry> {
  if (cached) return cached;
  const file = path.resolve(process.cwd(), "public", "network.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw) as NetworkRegistry;
  cached = parsed;
  return parsed;
}

/** All sites in the registry, including this one. */
export async function getNetworkRegistry(): Promise<NetworkRegistry> {
  return loadRegistry();
}

/** Sister sites only — current spoke filtered out by `siteConfig.url`. */
export async function getSisterProperties(): Promise<ReadonlyArray<Property>> {
  const reg = await loadRegistry();
  const me = siteConfig.url.replace(/\/$/, "");
  return reg.sites.filter((s) => s.url.replace(/\/$/, "") !== me);
}

/** All registry URLs except this spoke's — for `Organization.sameAs`. */
export async function getSameAsUrls(): Promise<ReadonlyArray<string>> {
  const sisters = await getSisterProperties();
  return sisters.map((s) => s.url);
}

/**
 * Synchronous loader for build-time scripts (`scripts/build-llms*.ts`)
 * that run before the Next bundle exists. Returns the registry as-is
 * — callers do their own filtering. Throws if the file is missing.
 */
export function loadRegistrySync(): NetworkRegistry {
  const file = path.resolve(process.cwd(), "public", "network.json");
  const raw = readFileSync(file, "utf8");
  return JSON.parse(raw) as NetworkRegistry;
}

export function getSisterPropertiesSync(): ReadonlyArray<Property> {
  const reg = loadRegistrySync();
  const me = siteConfig.url.replace(/\/$/, "");
  return reg.sites.filter((s) => s.url.replace(/\/$/, "") !== me);
}
