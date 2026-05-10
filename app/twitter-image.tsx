// Twitter card image is identical to the default OG image — same
// composition, same dimensions. Re-exports don't work for Next's
// metadata fields (runtime/size/contentType have to be statically
// analyzable on this module), so we inline the import.

import OpenGraphImage, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from "./opengraph-image";

export const runtime = "edge";
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default OpenGraphImage;
