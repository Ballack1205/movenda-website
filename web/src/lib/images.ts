// Sanity image URLs for team portraits. Source photos are 900×1350
// full-body shots. Center-cropping them to landscape (or a circle)
// cuts the head off and leaves a floating torso — never do that.

export type TeamPhotoVariant = "card" | "detail" | "face";

export function blogPhotoSrc(src: string, variant: "card" | "hero" | "inline" = "card"): string {
  if (src.startsWith("/")) return src;
  if (variant === "hero") return `${src}?w=1400&h=900&fit=max&auto=format`;
  if (variant === "inline") return `${src}?w=960&h=720&fit=max&auto=format`;
  return `${src}?w=1100&h=1400&fit=max&auto=format`;
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
