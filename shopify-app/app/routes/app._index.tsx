import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { InstallForm } from "../components/InstallForm";

/**
 * Main admin route. Loads the list of themes the merchant has so
 * they can pick a target (defaults to the published theme), then
 * renders the install form. The form posts to /app/install which
 * runs the Theme Asset API writes in a server action.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  // Raw REST client (`admin.rest.get`), NOT `admin.rest.resources.*`.
  // shopify.server.ts deliberately omits the REST resource catalog to
  // keep cold starts light, so `admin.rest.resources` is undefined.
  // The install action uses the same raw client end-to-end, so one
  // set of error shapes covers theme listing + the Asset API writes.
  const response = await admin.rest.get({ path: "themes" });
  let themes: Array<{ id: string; name: string; role: string }> = [];
  if (response.ok) {
    const body = (await response.json()) as {
      themes?: Array<{ id: number; name?: string; role?: string }>;
    };
    themes = (body.themes ?? []).map((t) => ({
      id: String(t.id),
      name: t.name ?? "(untitled)",
      role: t.role ?? "unpublished",
    }));
  }

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
