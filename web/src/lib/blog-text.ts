// Plain-text / Markdown views of a blog post. Used by /blog/*.md, rss.xml
// and llms.txt so crawlers and assistants can cite the article without
// parsing the marketing HTML.

import type { BlogPost } from "./content";
import { blogTagLabel } from "./blog";
import { absoluteUrl } from "./site";

export function portableTextToMarkdown(body: unknown): string {
  if (!Array.isArray(body)) return "";
  const lines: string[] = [];
  for (const raw of body) {
    const block = raw as {
      _type?: string;
      style?: string;
      listItem?: string;
      url?: string;
      alt?: string;
      children?: { text?: string }[];
    };
    if (!block) continue;
    if (block._type === "image") {
      if (block.url) lines.push(`![${block.alt || ""}](${block.url})`);
      continue;
    }
    const text = (block.children || []).map((child) => child.text || "").join("").trim();
    if (!text) continue;
    if (block.listItem === "bullet") lines.push(`- ${text}`);
    else if (block.listItem === "number") lines.push(`1. ${text}`);
    else if (block.style === "h2") lines.push(`## ${text}`);
    else if (block.style === "h3") lines.push(`### ${text}`);
    else if (block.style === "h4") lines.push(`#### ${text}`);
    else if (block.style === "blockquote") lines.push(`> ${text}`);
    else lines.push(text);
  }
  return lines.join("\n\n");
}

export function portableTextToPlain(body: unknown): string {
  return portableTextToMarkdown(body)
    .replace(/^[#>\-*\d.\s]+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownImage(src: string, alt: string): string {
  return `![${alt}](${absoluteUrl(src)})`;
}

/** Full Markdown document for /blog/{slug}.md — body plus local fallback photos. */
export function blogPostToMarkdown(post: BlogPost): string {
  const body = portableTextToMarkdown(post.body);
  const hasImages = /!\[[^\]]*\]\([^)]+\)/.test(body);
  const extras =
    !hasImages && post.photos?.length
      ? post.photos.map((src) => markdownImage(src, post.titel)).join("\n\n")
      : "";
  const tags = post.tags?.length ? `\nTags: ${post.tags.map(blogTagLabel).join(", ")}` : "";
  const byline = [post.publicatiedatum, post.auteurNaam].filter(Boolean).join(" · ");

  return `# ${post.titel}

${byline}${tags}

${post.excerpt ? `> ${post.excerpt}\n` : ""}
Bron: ${absoluteUrl(`/blog/${post.slug}`)}

${body}${extras ? `\n\n${extras}` : ""}
`;
}
