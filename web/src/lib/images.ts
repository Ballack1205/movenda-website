// Sanity image URLs for team portraits. Source photos are 900×1350
// full-body shots. Center-cropping them to landscape (or a circle)
// cuts the head off and leaves a floating torso — never do that.

export type TeamPhotoVariant = "card" | "detail" | "face";

export function blogPhotoSrc(src: string, variant: "card" | "hero" | "inline" = "card"): string {
  if (src.startsWith("/")) return src;
  if (variant === "hero") return `${src}?w=1400&h=880&fit=max&auto=format`;
  if (variant === "inline") return `${src}?w=960&h=720&fit=max&auto=format`;
  return `${src}?w=900&h=560&fit=max&auto=format`;
}

export function dienstPhotoSrc(src: string, variant: "card" | "hero" | "gallery" = "card"): string {
  if (variant === "hero") return `${src}?w=960&h=640&fit=max&auto=format`;
  if (variant === "gallery") return `${src}?w=720&h=540&fit=crop&auto=format`;
  return `${src}?w=800&h=500&fit=crop&auto=format`;
}

export function getuigenisPhotoSrc(foto: string): string {
  if (foto.startsWith("/")) return foto;
  return `${foto}?w=720&h=960&fit=crop&crop=focalpoint&auto=format`;
}

export type OgShape = "wide" | "square";

export interface OgImage {
  url: string;
  /** Only set when the dimensions are actually known (Sanity crop or og-default.jpg). */
  width?: number;
  height?: number;
}

/**
 * og:image source with known dimensions. Sanity CDN images get a fixed
 * 1200×630 (or 1200×1200 for portraits) crop so every share card is the
 * right shape. Other local files (blog covers in public/) keep their own size
 * and get no width/height tags rather than wrong ones.
 */
export function ogImageSrc(src: string, shape: OgShape = "wide"): OgImage {
  const wide = { width: 1200, height: 630 };
  const square = { width: 1200, height: 1200 };
  const dims = shape === "square" ? square : wide;
  if (!src.startsWith("http")) return src === "/og-default.jpg" ? { url: src, ...wide } : { url: src };
  const focal = shape === "square" ? "&crop=focalpoint&fp-x=0.5&fp-y=0.2" : "";
  return {
    url: `${src}?w=${dims.width}&h=${dims.height}&fit=crop${focal}&auto=format`,
    ...dims,
  };
}

export function teamPhotoSrc(foto: string, variant: TeamPhotoVariant = "card"): string {
  if (variant === "face") {
    // Small chip next to a name: keep the face, which sits in the upper fifth.
    return `${foto}?w=200&h=200&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.16&auto=format`;
  }
  if (variant === "detail") {
    return `${foto}?w=480&h=720&fit=max&auto=format`;
  }
  return `${foto}?w=600&h=900&fit=max&auto=format`;
}
