// Plain-text / Markdown views of a blog post. Used by /blog/*.md, rss.xml
// and llms.txt so crawlers and assistants can cite the article without
// parsing the marketing HTML.

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
