import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  DropZone,
  InlineStack,
  Layout,
  Page,
  Select,
  Tag,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { FORMAT_LABEL, FORMAT_ORDER, VALID_WEIGHTS } from "@/lib/generators";
import type { FontFormat, FontStyle, FontWeight } from "@/lib/generators";
import { InstallForm } from "../components/InstallForm";

/**
 * Main admin route. Loads the list of themes the merchant has so
 * they can pick a target (defaults to the published theme), then
 * renders the install form. The form posts to /app/install which
 * runs the Theme Asset API writes in a server action.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  // Fetch themes via the Admin REST endpoint — the GraphQL Admin API
  // also exposes themes but the REST endpoint is the documented path
  // for the matching Asset API write we use in the install action,
  // and using the same client end-to-end means one set of error
  // shapes to handle.
  const response = await admin.rest.resources.Theme.all({ session: undefined });
  const themes = (response.data ?? []).map((t) => ({
    id: String(t.id),
    name: t.name ?? "(untitled)",
    role: t.role ?? "unpublished",
  }));

  return { themes };
}

export default function AppIndex() {
  const { themes } = useLoaderData<typeof loader>();
  return (
    <Page
      title="Install a custom font"
      subtitle="Upload your font files, pick a theme, and the app writes the @font-face block + CSS variable overrides directly into the theme."
    >
      <Layout>
        <Layout.Section>
          <InstallForm themes={themes} />
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                What this does
              </Text>
              <Text as="p" tone="subdued">
                Uploads your font files to <code>assets/</code>, writes a single{" "}
                <code>assets/shopifont.css</code> file containing the @font-face
                declarations and CSS variable overrides, and inserts a{" "}
                <code>{"{{ 'shopifont.css' | asset_url | stylesheet_tag }}"}</code>{" "}
                line into <code>layout/theme.liquid</code> between marker comments
                so future re-runs update cleanly.
              </Text>
              <Text as="p" tone="subdued">
                Nothing else in your theme is touched. Uninstalling the app
                removes the marker block and the assets it created.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
