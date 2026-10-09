// Running copy that Julie formats in Studio (type "richText": bold, italic,
// links and the sizes Normaal / Groot / Klein). Fields that are not converted
// yet still hold a plain string, so every reader here accepts both.
import { escapeHTML, toHTML } from "@portabletext/to-html";

export type RichValue = string | readonly unknown[] | null | undefined;

interface Block {
  _type?: string;
  children?: { text?: string }[];
}

export const isBlocks = (value: RichValue): value is readonly unknown[] => Array.isArray(value);

const blockText = (block: unknown): string =>
  ((block as Block)?.children || []).map((child) => child.text || "").join("");

const textBlocks = (value: readonly unknown[]) =>
  value.filter((block) => (block as Block)?._type === "block" && blockText(block).trim());

/** True when there is nothing to show (empty string, no blocks, or blank blocks). */
export function isLeeg(value: RichValue): boolean {
  if (!value) return true;
  return isBlocks(value) ? textBlocks(value).length === 0 : !value.trim();
}

/** Plain text, paragraphs separated by a blank line. For cards, meta tags, JSON-LD and llms.txt. */
export function alsTekst(value: RichValue): string {
  if (!value) return "";
  if (!isBlocks(value)) return value;
  return textBlocks(value).map((block) => blockText(block).trim()).join("\n\n");
}

const GROOT = "text-xl font-medium leading-snug text-brand-text";
const KLEIN = "text-sm";

/**
 * HTML for the body: one <p> per paragraph. A plain string is split on blank
 * lines, as before. `pClass` goes on every plain paragraph, for pages whose
 * stylesheet targets a paragraph class.
 */
export function richHtml(value: RichValue, pClass?: string): string {
  if (!value) return "";
  const open = pClass ? `<p class="${pClass}">` : "<p>";
  if (!isBlocks(value)) {
    return value
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `${open}${escapeHTML(p)}</p>`)
      .join("");
  }
  return toHTML(textBlocks(value) as never, {
    components: {
      block: {
        normal: ({ children }) => `${open}${children}</p>`,
        groot: ({ children }) => `<p class="${[pClass, GROOT].filter(Boolean).join(" ")}">${children}</p>`,
        klein: ({ children }) => `<p class="${[pClass, KLEIN].filter(Boolean).join(" ")}">${children}</p>`,
      },
      marks: {
        link: ({ children, value: mark }) => {
          const href = String((mark as { href?: string })?.href || "").trim();
          return href
            ? `<a href="${escapeHTML(href)}" class="text-brand-primary hover:underline">${children}</a>`
            : String(children);
        },
      },
    },
  });
}
