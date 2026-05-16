import type { ActionFunctionArgs } from "@remix-run/node";
import {
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";

import { authenticate } from "../shopify.server";
import {
  buildCssVariableOverrides,
  buildFontFaceCss,
  fromSimple,
  type FontFormat,
  type FontStyle,
  type FontWeight,
  type SimpleGeneratorInput,
  FORMAT_ORDER,
  VALID_WEIGHTS,
} from "@/lib/generators";
import { slugify } from "@/lib/generators/slugify";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per font file
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB across all uploads
const STYLESHEET_KEY = "assets/shopifont.css";
const THEME_LAYOUT_KEY = "layout/theme.liquid";
const MARKER_START = "{% comment %} shopifont:start {% endcomment %}";
const MARKER_END = "{% comment %} shopifont:end {% endcomment %}";

type ActionResponse =
  | { ok: true; themeId: string; assetKeys: string[] }
  | { ok: false; error: string };

/**
 * Install action. POST /app/install with multipart/form-data:
 *   themeId, fontName, formats, weight, style, applyHeading,
 *   applyBody, additionalWeights, files[]
 *
 * Pipeline:
 *   1. Validate inputs against the generator's allowed shapes.
 *   2. For each uploaded font file, PUT to assets/{key} via Theme
 *      Asset API as base64 attachment.
 *   3. Build the consolidated `shopifont.css` (@font-face blocks +
 *      CSS variable overrides) from the same lib/generators/*
 *      functions the website + extension use. PUT to assets/.
 *   4. Read layout/theme.liquid, splice our marker block in (or
 *      replace if it already exists), PUT it back.
 *
 * Failures abort the pipeline and return { ok: false } — the asset
 * uploads aren't transactional, but a partial install still leaves
 * a working CSS file (the layout edit is the last step).
 */
export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { admin, session } = await authenticate.admin(request);

  let formData: FormData;
  try {
    formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: MAX_FILE_BYTES }),
    );
  } catch {
    return json({ ok: false, error: "Upload too large or malformed." }, 413);
  }

  const parsed = parseInputs(formData);
  if (!parsed.ok) {
    return json({ ok: false, error: parsed.error }, 400);
  }
  const {
    themeId,
    fontName,
    formats,
    weight,
    style,
    applyTo,
    additionalWeights,
    files,
  } = parsed.value;

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return json(
      { ok: false, error: "Combined upload exceeds 20MB. Use WOFF2 for smaller payloads." },
      413,
    );
  }

  const baseName = slugify(fontName) || "custom-font";
  const useWeightSuffix = additionalWeights.length > 0;
  const expectedAllWeights = useWeightSuffix
    ? [weight, ...additionalWeights]
    : [weight];

  // Validate that uploaded filenames look right for the requested
  // weight x format matrix. We don't reject on mismatch (foundry
  // names can be anything — we rename on upload), but we DO use the
  // canonical `${baseName}-${weight}.${ext}` naming on Shopify so
  // the @font-face URLs resolve.
  type Plan = { weight: FontWeight; format: FontFormat; key: string; file: File };
  const plan: Plan[] = [];

  // Heuristic: assume the file at index `i` corresponds to weight
  // `expectedAllWeights[Math.floor(i / formats.length)]` and format
  // `formats[i % formats.length]`. Merchants who upload a different
  // mix get the file pinned to a deterministic Shopify filename so
  // the CSS at least resolves. The UX guidance text on the form
  // tells them the expected matching pattern.
  for (let i = 0; i < files.length; i++) {
    const wIdx = Math.floor(i / formats.length);
    const fIdx = i % formats.length;
    const w = expectedAllWeights[wIdx] ?? weight;
    const f = formats[fIdx] ?? "woff2";
    const stem = useWeightSuffix ? `${baseName}-${w}` : baseName;
    plan.push({
      weight: w,
      format: f,
      key: `assets/${stem}.${f}`,
      file: files[i]!,
    });
  }

  // 1) Upload each font file. Shopify accepts base64 in the
  //    `attachment` field for binary assets.
  const uploadedKeys: string[] = [];
  for (const item of plan) {
    const buffer = Buffer.from(await item.file.arrayBuffer());
    const attachment = buffer.toString("base64");
    const res = await admin.rest.put({
      path: `themes/${themeId}/assets`,
      data: {
        asset: { key: item.key, attachment },
      },
    });
    if (!res.ok) {
      const errMsg = await safeErrorText(res);
      return json(
        {
          ok: false,
          error: `Failed to upload ${item.key}: ${errMsg}. Aborted before writing CSS.`,
        },
        502,
      );
    }
    uploadedKeys.push(item.key);
  }

  // 2) Build the consolidated stylesheet from the same generator
  //    functions the marketing site uses. The generator API is the
  //    multi-face v2 shape; `fromSimple` adapts our flat inputs into
  //    it (same path the site's legacy callers use). `fileBaseName`
  //    is pinned to the exact `baseName` the upload step keyed assets
  //    under, so the @font-face `url()`s resolve to the files we just
  //    PUT (single-face → `baseName.ext`, multi → `baseName-{w}.ext`).
  const simpleInput: SimpleGeneratorInput = {
    fontName,
    formats,
    weight,
    style,
    fileBaseName: baseName,
    applyTo,
    additionalWeights:
      additionalWeights.length > 0 ? additionalWeights : undefined,
  };
  const generatorInput = fromSimple(simpleInput);
  const stylesheet = [
    "/* Generated by Shopifont. Do not edit by hand — re-run the app to update. */",
    buildFontFaceCss(generatorInput),
    "",
    buildCssVariableOverrides(generatorInput),
  ].join("\n");

  const cssRes = await admin.rest.put({
    path: `themes/${themeId}/assets`,
    data: { asset: { key: STYLESHEET_KEY, value: stylesheet } },
  });
  if (!cssRes.ok) {
    return json(
      {
        ok: false,
        error: `Uploaded font files but failed to write ${STYLESHEET_KEY}. Run install again to retry.`,
      },
      502,
    );
  }
  uploadedKeys.push(STYLESHEET_KEY);

  // 3) Inject the stylesheet_tag into layout/theme.liquid between
  //    marker comments. If markers exist, replace; otherwise insert
  //    right before </head>.
  const layoutRes = await admin.rest.get({
    path: `themes/${themeId}/assets`,
    query: { "asset[key]": THEME_LAYOUT_KEY },
  });
  if (!layoutRes.ok) {
    return json(
      {
        ok: false,
        error: `Could not read layout/theme.liquid. Stylesheet uploaded but not yet linked. Add {{ 'shopifont.css' | asset_url | stylesheet_tag }} to your theme.liquid <head> manually.`,
      },
      502,
    );
  }
  const layoutBody = (await layoutRes.json()) as {
    asset?: { value?: string };
  };
  const currentLiquid = layoutBody.asset?.value ?? "";
  const updatedLiquid = injectMarkerBlock(currentLiquid);

  if (updatedLiquid !== currentLiquid) {
    const writeRes = await admin.rest.put({
      path: `themes/${themeId}/assets`,
      data: {
        asset: { key: THEME_LAYOUT_KEY, value: updatedLiquid },
      },
    });
    if (!writeRes.ok) {
      return json(
        {
          ok: false,
          error: `Stylesheet uploaded, but failed to update layout/theme.liquid. Add the link tag manually before going live.`,
        },
        502,
      );
    }
    uploadedKeys.push(THEME_LAYOUT_KEY);
  }

  // Stamp the install on the session row for diagnostics. Optional —
  // safe to fail silently if the column ever drifts.
  try {
    void session;
    // (no-op for now; future: log install timestamp to a separate table)
  } catch {
    /* noop */
  }

  return json({ ok: true, themeId, assetKeys: uploadedKeys });
}

function parseInputs(form: FormData):
  | {
      ok: true;
      value: {
        themeId: string;
        fontName: string;
        formats: ReadonlyArray<FontFormat>;
        weight: FontWeight;
        style: FontStyle;
        applyTo: ReadonlyArray<"heading" | "body">;
        additionalWeights: ReadonlyArray<FontWeight>;
        files: File[];
      };
    }
  | { ok: false; error: string } {
  const themeId = String(form.get("themeId") ?? "").trim();
  if (!themeId || !/^\d+$/.test(themeId)) {
    return { ok: false, error: "Invalid theme selection." };
  }

  const fontName = String(form.get("fontName") ?? "").trim();
  if (fontName.length === 0 || fontName.length > 64) {
    return { ok: false, error: "Font name is required (max 64 chars)." };
  }

  const formatsRaw = String(form.get("formats") ?? "").trim();
  const formats = formatsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is FontFormat => FORMAT_ORDER.includes(s as FontFormat));
  if (formats.length === 0) {
    return { ok: false, error: "Select at least one format (WOFF2 recommended)." };
  }

  const weightNum = Number(form.get("weight") ?? "400");
  if (!VALID_WEIGHTS.includes(weightNum as FontWeight)) {
    return { ok: false, error: "Invalid weight." };
  }
  const weight = weightNum as FontWeight;

  const styleRaw = String(form.get("style") ?? "normal");
  const style: FontStyle = styleRaw === "italic" ? "italic" : "normal";

  const applyHeading = form.get("applyHeading") === "1";
  const applyBody = form.get("applyBody") === "1";
  if (!applyHeading && !applyBody) {
    return { ok: false, error: "Select at least one of Headings or Body." };
  }
  const applyTo: Array<"heading" | "body"> = [];
  if (applyHeading) applyTo.push("heading");
  if (applyBody) applyTo.push("body");

  const extraRaw = String(form.get("additionalWeights") ?? "").trim();
  const additionalWeights: FontWeight[] = [];
  if (extraRaw.length > 0) {
    const seen = new Set<FontWeight>([weight]);
    for (const part of extraRaw.split(",")) {
      const n = Number(part.trim());
      if (
        Number.isFinite(n) &&
        VALID_WEIGHTS.includes(n as FontWeight) &&
        !seen.has(n as FontWeight)
      ) {
        seen.add(n as FontWeight);
        additionalWeights.push(n as FontWeight);
      }
    }
  }

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return { ok: false, error: "Upload at least one font file." };
  }

  return {
    ok: true,
    value: {
      themeId,
      fontName,
      formats,
      weight,
      style,
      applyTo,
      additionalWeights,
      files,
    },
  };
}

/**
 * Splice the marker block into (or out of) layout/theme.liquid.
 *
 * Idempotent: if the block already exists between markers, replace
 * it with the canonical line. If the markers are absent, insert
 * before the closing </head>.
 *
 * Refuses to inject if no </head> tag is found (returns input
 * unchanged) — some heavily customized themes use {% include %}'d
 * head partials, in which case the merchant has to add the line
 * by hand.
 */
function injectMarkerBlock(liquid: string): string {
  const block = [
    MARKER_START,
    "{{ 'shopifont.css' | asset_url | stylesheet_tag }}",
    MARKER_END,
  ].join("\n");

  const startIdx = liquid.indexOf(MARKER_START);
  const endIdx = liquid.indexOf(MARKER_END);
  if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
    const before = liquid.slice(0, startIdx);
    const after = liquid.slice(endIdx + MARKER_END.length);
    return `${before}${block}${after}`;
  }

  // Insert before first </head> (case-insensitive). Some themes use
  // <HEAD> uppercase or extra whitespace inside the tag; we match
  // a permissive regex.
  const headCloseRe = /<\s*\/\s*head\s*>/i;
  const match = liquid.match(headCloseRe);
  if (!match || match.index === undefined) return liquid;

  const insertAt = match.index;
  return `${liquid.slice(0, insertAt)}${block}\n  ${liquid.slice(insertAt)}`;
}

async function safeErrorText(res: Response): Promise<string> {
  try {
    const body = await res.text();
    return body.slice(0, 200);
  } catch {
    return `HTTP ${res.status}`;
  }
}

function json<T extends ActionResponse>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
