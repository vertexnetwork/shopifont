import { useCallback, useMemo, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  DropZone,
  InlineStack,
  Select,
  Tag,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";

import { FORMAT_LABEL, FORMAT_ORDER, VALID_WEIGHTS } from "@/lib/generators";
import type { FontFormat, FontStyle, FontWeight } from "@/lib/generators";

type Theme = { id: string; name: string; role: string };

type InstallResponse =
  | { ok: true; themeId: string; assetKeys: string[] }
  | { ok: false; error: string };

const WEIGHT_LABEL: Record<FontWeight, string> = {
  100: "100 — Thin",
  200: "200 — Extra Light",
  300: "300 — Light",
  400: "400 — Regular",
  500: "500 — Medium",
  600: "600 — Semi Bold",
  700: "700 — Bold",
  800: "800 — Extra Bold",
  900: "900 — Black",
};

/**
 * Embedded install form. Owns ALL UI state for the merchant's input;
 * on submit, packages everything into multipart/form-data and POSTs
 * to /app/install. The action route handles validation and the
 * actual Theme Asset API writes.
 */
export function InstallForm({ themes }: { themes: ReadonlyArray<Theme> }) {
  const fetcher = useFetcher<InstallResponse>();
  const submitting = fetcher.state !== "idle";

  // Default the theme select to the published theme (most merchants
  // want to install on production). Falls back to first if none has
  // role=main.
  const defaultThemeId =
    themes.find((t) => t.role === "main")?.id ?? themes[0]?.id ?? "";

  const [themeId, setThemeId] = useState<string>(defaultThemeId);
  const [fontName, setFontName] = useState<string>("");
  const [formats, setFormats] = useState<ReadonlyArray<FontFormat>>(["woff2"]);
  const [weight, setWeight] = useState<FontWeight>(400);
  const [style, setStyle] = useState<FontStyle>("normal");
  const [applyHeading, setApplyHeading] = useState(true);
  const [applyBody, setApplyBody] = useState(true);
  const [additionalWeights, setAdditionalWeights] = useState<FontWeight[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const toggleFormat = useCallback((f: FontFormat) => {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }, []);

  const addWeight = useCallback(
    (w: FontWeight) => {
      if (w === weight) return;
      setAdditionalWeights((prev) => (prev.includes(w) ? prev : [...prev, w]));
    },
    [weight],
  );

  const removeWeight = useCallback((w: FontWeight) => {
    setAdditionalWeights((prev) => prev.filter((x) => x !== w));
  }, []);

  const availableExtraWeights = VALID_WEIGHTS.filter(
    (w) => w !== weight && !additionalWeights.includes(w),
  );

  const handleDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const canSubmit =
    fontName.trim().length > 0 &&
    files.length > 0 &&
    formats.length > 0 &&
    (applyHeading || applyBody) &&
    themeId.length > 0 &&
    !submitting;

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;
      const fd = new FormData();
      fd.set("themeId", themeId);
      fd.set("fontName", fontName);
      fd.set("formats", formats.join(","));
      fd.set("weight", String(weight));
      fd.set("style", style);
      fd.set("applyHeading", applyHeading ? "1" : "0");
      fd.set("applyBody", applyBody ? "1" : "0");
      if (additionalWeights.length > 0) {
        fd.set("additionalWeights", additionalWeights.join(","));
      }
      for (const file of files) {
        fd.append("files", file, file.name);
      }
      fetcher.submit(fd, {
        method: "POST",
        action: "/app/install",
        encType: "multipart/form-data",
      });
    },
    [
      canSubmit,
      themeId,
      fontName,
      formats,
      weight,
      style,
      applyHeading,
      applyBody,
      additionalWeights,
      files,
      fetcher,
    ],
  );

  const result = fetcher.data;

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <BlockStack gap="400">
          {result?.ok ? (
            <Banner tone="success" title="Font installed">
              Wrote {result.assetKeys.length} files to your theme. Open your
              storefront in a fresh tab to see the new typography. The asset
              keys: {result.assetKeys.join(", ")}.
            </Banner>
          ) : null}
          {result?.ok === false ? (
            <Banner tone="critical" title="Install failed">
              {result.error}
            </Banner>
          ) : null}

          <Select
            label="Target theme"
            options={themes.map((t) => ({
              label: `${t.name}${t.role === "main" ? " (published)" : ""}`,
              value: t.id,
            }))}
            value={themeId}
            onChange={setThemeId}
            helpText="The font installs on this theme only. Other themes are not touched."
          />

          <TextField
            autoComplete="off"
            label="Custom font name"
            value={fontName}
            onChange={setFontName}
            placeholder="My Brand Sans"
            helpText="Becomes the font-family in the @font-face block."
            requiredIndicator
          />

          <DropZone
            accept=".woff2,.woff,.ttf,.otf,.eot"
            onDrop={handleDrop}
            type="file"
            allowMultiple
          >
            <DropZone.FileUpload
              actionTitle="Add font files"
              actionHint=".woff2 / .woff / .ttf / .otf / .eot"
            />
          </DropZone>

          {files.length > 0 ? (
            <BlockStack gap="100">
              {files.map((file, idx) => (
                <InlineStack key={`${file.name}-${idx}`} align="space-between">
                  <InlineStack gap="200" blockAlign="center">
                    <Thumbnail
                      source="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png"
                      alt=""
                      size="small"
                    />
                    <Text as="span" variant="bodySm">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </Text>
                  </InlineStack>
                  <Button
                    variant="plain"
                    onClick={() => removeFile(idx)}
                    accessibilityLabel={`Remove ${file.name}`}
                  >
                    Remove
                  </Button>
                </InlineStack>
              ))}
            </BlockStack>
          ) : null}

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="medium">
              Formats
            </Text>
            <InlineStack gap="200" wrap>
              {FORMAT_ORDER.map((fmt) => (
                <Checkbox
                  key={fmt}
                  label={FORMAT_LABEL[fmt]}
                  checked={formats.includes(fmt)}
                  onChange={() => toggleFormat(fmt)}
                />
              ))}
            </InlineStack>
            <Text as="span" tone="subdued" variant="bodySm">
              Filenames you uploaded must match {`{name}.<ext>`} (or{" "}
              {`{name}-{weight}.<ext>`} when using multi-weight) — the @font-face
              block references them by exact filename.
            </Text>
          </BlockStack>

          <InlineStack gap="400" wrap>
            <Box minWidth="240px">
              <Select
                label="Primary weight"
                options={VALID_WEIGHTS.map((w) => ({
                  label: WEIGHT_LABEL[w],
                  value: String(w),
                }))}
                value={String(weight)}
                onChange={(v) => setWeight(Number(v) as FontWeight)}
              />
            </Box>
            <Box minWidth="160px">
              <Select
                label="Style"
                options={[
                  { label: "normal", value: "normal" },
                  { label: "italic", value: "italic" },
                ]}
                value={style}
                onChange={(v) => setStyle(v === "italic" ? "italic" : "normal")}
              />
            </Box>
          </InlineStack>

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="medium">
              Additional weights
            </Text>
            <InlineStack gap="200" wrap>
              {additionalWeights.map((w) => (
                <Tag key={w} onRemove={() => removeWeight(w)}>
                  {String(w)}
                </Tag>
              ))}
              {availableExtraWeights.length > 0 ? (
                <Box minWidth="220px">
                  <Select
                    label=""
                    labelHidden
                    options={[
                      { label: "+ Add another weight", value: "" },
                      ...availableExtraWeights.map((w) => ({
                        label: WEIGHT_LABEL[w],
                        value: String(w),
                      })),
                    ]}
                    value=""
                    onChange={(v) => {
                      const n = Number(v);
                      if (Number.isFinite(n) && n > 0) {
                        addWeight(n as FontWeight);
                      }
                    }}
                  />
                </Box>
              ) : null}
            </InlineStack>
          </BlockStack>

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="medium">
              Apply to
            </Text>
            <InlineStack gap="400">
              <Checkbox
                label="Headings"
                checked={applyHeading}
                onChange={setApplyHeading}
              />
              <Checkbox
                label="Body"
                checked={applyBody}
                onChange={setApplyBody}
              />
            </InlineStack>
          </BlockStack>

          <Box paddingBlockStart="200">
            <Button
              submit
              variant="primary"
              loading={submitting}
              disabled={!canSubmit}
            >
              Install on theme
            </Button>
          </Box>
        </BlockStack>
      </form>
    </Card>
  );
}
