/**
 * Lower-case, hyphen-joined, alpha-numeric. Used to derive a safe
 * Shopify asset filename when the user hasn't specified one.
 *
 * Shopify Asset filenames are case-insensitive on lookup but the Liquid
 * filter `| asset_url` returns the file path verbatim, so we want a
 * predictable lowercased slug.
 */
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
