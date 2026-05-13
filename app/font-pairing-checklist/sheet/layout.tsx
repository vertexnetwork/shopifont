import type { Metadata } from "next";

/**
 * Minimal layout for the printable checklist sheet. Sits OUTSIDE the
 * `(site)` route group so it inherits none of the Shopifont chrome
 * (Header, Footer, sticky CTA, ads, Clarity). What the visitor (and
 * their printer) see is just the content.
 *
 * Marked `noindex` so the lead-magnet sheet doesn't show up as its
 * own search result — the marketing landing at /font-pairing-checklist
 * is the indexable surface.
 */
export const metadata: Metadata = {
  title: "Shopify Font-Pairing Checklist",
  description:
    "The six-axis font-pairing checklist for Shopify storefronts. Print to PDF or save the page.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ChecklistSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
