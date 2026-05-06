"use client";

import { GeneratorInputs } from "./Inputs";
import { GeneratorPreview } from "./Preview";
import { CodeBlock } from "./CodeBlock";
import { useGenerator } from "./state";

/**
 * The full Shopifont generator surface. Embedded on the homepage and
 * on every pSEO page. Pure client-side string interpolation — no
 * network, no upload, no server round-trip.
 */
export function ShopifontGenerator() {
  const state = useGenerator();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GeneratorInputs state={state} />
        <GeneratorPreview state={state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CodeBlock
          title="@font-face CSS"
          description="Paste at the bottom of assets/base.css. Uses Liquid's asset_url filter — Shopify resolves the path at render time."
          code={state.fontFaceCss}
          language="css"
        />
        <CodeBlock
          title="settings_schema.json"
          description="Adds a Theme Editor section so non-technical merchants can toggle the font on or off."
          code={state.settingsSchemaJson}
          language="json"
        />
        <CodeBlock
          title="CSS variable overrides"
          description="Retargets Dawn's --font-heading-family / --font-body-family. Survives theme updates."
          code={state.cssVariableOverrides}
          language="css"
        />
      </div>
    </div>
  );
}
