// Blog helpers. Adding a post must never require a new Astro page or a
// slug map in content.ts:
//
//   Julie (Sanity): titel, slug, excerpt, body, datum, auteur, tags.
//   Wij: drop files in web/public/blog-covers/
//     {slug}.jpg       cover
//     {slug}-2.jpg     extra in-article photo (optional -3.jpg, -4.jpg, …)
//     {slug}.contain   empty marker — screenshot, do not crop
//
// Listing, article, RSS, /blog.md, /blog/{slug}.md and llms.txt pick
// the record up automatically.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const blogCoversDir = fileURLToPath(new URL("../../public/blog-covers/", import.meta.url));
const IMAGE_EXTS = [".jpg", ".jpeg", ".webp", ".png"] as const;

/** Closed tag list — same values Julie picks in Sanity. Related posts match on these. */
export const BLOG_TAGS = [
  { value: "rugpijn", label: "Rugpijn" },
  { value: "nekpijn", label: "Nekpijn" },
  { value: "sportblessures", label: "Sportblessures" },
  { value: "training", label: "Training" },
  { value: "herstel", label: "Herstel" },
  { value: "preventie", label: "Preventie" },
  { value: "hitte", label: "Hitte" },
  { value: "mentale-training", label: "Mentale training" },
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number]["value"];

export function blogTagLabel(tag: string): string {
  return BLOG_TAGS.find((item) => item.value === tag)?.label ?? tag;
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function localImage(basename: string): string | undefined {
  for (const ext of IMAGE_EXTS) {
    const name = `${basename}${ext}`;
    if (existsSync(join(blogCoversDir, name))) return `/blog-covers/${name}`;
  }
}

export function localBlogCover(slug: string): string | undefined {
  return localImage(slug);
}

export function localBlogPhotos(slug: string): string[] {
  const extras: string[] = [];
  for (let i = 2; i <= 8; i++) {
    const src = localImage(`${slug}-${i}`);
    if (!src) break;
    extras.push(src);
  }
  return extras;
}

export function localBlogCoverFit(slug: string): "contain" | undefined {
  if (existsSync(join(blogCoversDir, `${slug}.contain`))) return "contain";
}

export function resolveBlogMedia(
  slug: string,
  fromSanity: { cover?: string; coverFit?: string; photos?: string[] },
): { cover?: string; photos: string[]; coverFit: "cover" | "contain" } {
  return {
    cover: fromSanity.cover || localBlogCover(slug),
    photos: fromSanity.photos?.length ? fromSanity.photos : localBlogPhotos(slug),
    coverFit:
      fromSanity.coverFit === "contain" || localBlogCoverFit(slug) ? "contain" : "cover",
  };
}
