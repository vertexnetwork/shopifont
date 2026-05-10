import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site-config";

/**
 * Brand mark + wordmark composition. Reads the site name from
 * `siteConfig.name` so a brand rename is one edit. Used in the header
 * and footer.
 */
export function Wordmark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const textSize = size === "sm" ? "text-base" : "text-base sm:text-lg";
  return (
    <span
      aria-label={siteConfig.name}
      className={
        "inline-flex items-center gap-2 text-charcoal font-semibold tracking-tight " +
        className
      }
    >
      <Logo className={`${iconSize} text-charcoal`} />
      <span className={textSize}>{siteConfig.name}</span>
    </span>
  );
}
