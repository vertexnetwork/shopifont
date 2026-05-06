import { JsonLd } from "./JsonLd";

/**
 * "How to install a custom font on Shopify" — three-step HowTo schema
 * for the homepage. PLAN.md §4 calls this out specifically as a pGEO
 * signal.
 */
export function HowToSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install a custom font on a Shopify theme",
    description:
      "Generate the @font-face, settings_schema, and CSS variable code for any custom font, then paste each block into your Shopify theme.",
    totalTime: "PT5M",
    supply: [
      {
        "@type": "HowToSupply",
        name: "Custom font file (WOFF2 recommended)",
      },
      {
        "@type": "HowToSupply",
        name: "Shopify theme code editor access",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Enter your font name and select formats",
        text: "Type your font's display name and tick the format checkboxes for the files you have. WOFF2 covers ~97% of modern browsers.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Copy the three generated blocks",
        text: "The site outputs three code blocks: the @font-face CSS, a settings_schema.json snippet, and a CSS-variable override. Each has its own copy button.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Paste into your Shopify theme",
        text: "Upload the font file to assets/, paste the @font-face into base.css, the JSON into settings_schema.json, and append the CSS variables. Save and refresh.",
        position: 3,
      },
    ],
  };
  return <JsonLd id="howto-schema" data={data} />;
}
