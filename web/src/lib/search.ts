export type SearchKind = "page" | "dienst" | "team" | "blog" | "event";

export type SearchItem = {
  title: string;
  href: string;
  /** Aliases and short labels. Matched at any query length. */
  keys: string;
  /** Longer copy. Only matched once the query is specific. */
  text: string;
  kind: SearchKind;
};

export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/**
 * Title and alias matches win. A short query does not search article text,
 * so "mpc" opens the centre instead of every post that mentions the name.
 */
export function rankSearch(items: SearchItem[], raw: string, limit = 8): SearchItem[] {
  const q = fold(raw.trim());
  if (q.length < 3) return [];
  const tokens = q.split(/\s+/).filter((token) => token.length > 1);
  if (tokens.length === 0) return [];
  const kindBoost: Record<SearchKind, number> = { page: 24, dienst: 16, team: 10, event: 4, blog: 0 };
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = fold(item.title);
    const keys = fold(item.keys);
    const text = fold(item.text);
    const inTitle = tokens.every((token) => title.includes(token));
    const inKeys = tokens.every((token) => keys.includes(token));
    const inText = q.length >= 5 && tokens.every((token) => text.includes(token));
    if (!inTitle && !inKeys && !inText) continue;
    let score = kindBoost[item.kind];
    if (title === q) score += 200;
    else if (title.startsWith(q)) score += 140;
    else if (inTitle && title.includes(q)) score += 90;
    else if (inTitle) score += 70;
    if (inKeys) score += 80;
    if (inText && !inTitle && !inKeys) score += 8;
    scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "nl"));
  return scored.slice(0, limit).map((row) => row.item);
}
