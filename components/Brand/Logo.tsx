/**
 * Shopifont brand glyph. A stylized 'S' spine paired with a brand-blue
 * punctuation dot — the typographic equivalent of "Shopifont." period.
 * Single SVG path so it renders crisply at every size and inherits
 * `currentColor` from the surrounding text.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Shopifont"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5 8.2C22 6.6 19.2 5.4 16.4 5.4c-3.6 0-6.7 1.9-6.7 5 0 2.7 2.4 3.9 6.6 4.9 4.9 1.2 7.7 2.7 7.7 6.4 0 3.5-3.5 5.6-7.6 5.6-3.6 0-7-1.6-8.4-3.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="25" cy="7" r="2" fill="var(--color-electric)" />
    </svg>
  );
}
