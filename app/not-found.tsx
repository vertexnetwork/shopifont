import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 flex flex-col gap-4">
      <p className="text-xs uppercase tracking-wide text-muted">404</p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        That page doesn&apos;t exist.
      </h1>
      <p className="text-charcoal/80">
        The generator is on the homepage. Try one of the theme-specific guides
        from the footer, or head back home.
      </p>
      <p>
        <Link
          href="/"
          className="inline-block min-h-[var(--spacing-touch)] px-4 rounded-md bg-charcoal text-paper hover:bg-electric"
        >
          Back to the generator
        </Link>
      </p>
    </div>
  );
}
